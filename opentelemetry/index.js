const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')

/**
 * Error: "@opentelemetry/instrumentation-grpc Module @grpc/grpc-js has
 * been loaded before @opentelemetry/instrumentation-grpc so it might not work,
 * please initialize it before requiring @grpc/grpc-js"
 *
 * Fix: "call getNodeAutoInstrumentations() before require('@opentelemetry/sdk-node');"
 */
//

// Disable DNS instrumentation, because the instrumentation does not correctly patches `dns.lookup` function
// if the function is converted to a promise-based method using `utils.promisify(dns.lookup)`
// See: https://github.com/Joystream/joystream/pull/4779#discussion_r1262515887
const instrumentations = getNodeAutoInstrumentations({ '@opentelemetry/instrumentation-dns': { enabled: false } })

const { NodeSDK } = require('@opentelemetry/sdk-node')
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto')
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics')
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-node')

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, `.env`) })

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)

function addInstrumentation() {
  const instrumentation = new NodeSDK({
    spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter(), {
      maxQueueSize: parseInt(process.env.OTEL_MAX_QUEUE_SIZE || '8192'),
      maxExportBatchSize: parseInt(process.env.OTEL_MAX_EXPORT_BATCH_SIZE || '1024'),
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
    }),
    instrumentations,
  })

  // Start Opentelemetry NodeJS Instrumentation
  diag.info('Starting tracing...')
  instrumentation.start()

  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    instrumentation
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0))
  })
}

addInstrumentation()
