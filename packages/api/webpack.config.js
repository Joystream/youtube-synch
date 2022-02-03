var IgnorePlugin = require('webpack').IgnorePlugin;

module.exports = (config, context) => {
  // extend, mutate, create a new config (whatever you want)

  config.plugins = [
    ...config.plugins,
    new IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
            "@nestjs/microservices",
            "@nestjs/platform-express",
            "cache-manager",
            "class-validator",
            "class-transformer",
            "@nestjs/websockets/socket-module",
            "@nestjs/microservices/microservices-module",
            "class-transformer/storage",
            "fastify-swagger",
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource);
        } catch (err) {
          return true;
        }
        return false;
      },
    }),
  ];
  config.output.libraryTarget = 'commonjs2'

  return config;
};