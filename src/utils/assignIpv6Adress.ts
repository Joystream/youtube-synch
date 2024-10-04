import AWS from 'aws-sdk'
import 'dotenv/config'

const ec2 = new AWS.EC2({
  region: process.env.YT_SYNCH__AWS__REGION || '',
  credentials: {
    accessKeyId: process.env.YT_SYNCH__AWS__CREDENTIALS__ACCESS_KEY_ID || '',
    secretAccessKey: process.env.YT_SYNCH__AWS__CREDENTIALS__SECRET_ACCESS_KEY || '',
  },
})

const instanceId = 'i-0068bb1e051e3f287'

async function assignNewIPv6() {
  const timestamp = new Date().toISOString()
  try {
    // Describe the network interfaces attached to the instance
    const networkInterfaces = await ec2
      .describeNetworkInterfaces({
        Filters: [{ Name: 'attachment.instance-id', Values: [instanceId] }],
      })
      .promise()

    if (!networkInterfaces.NetworkInterfaces || networkInterfaces.NetworkInterfaces.length === 0) {
      throw new Error(`[${timestamp}] No network interfaces found for instance ID: ${instanceId}`)
    }

    const networkInterfaceId = networkInterfaces.NetworkInterfaces[0].NetworkInterfaceId || ''
    const ipv6Addresses = networkInterfaces.NetworkInterfaces[0].Ipv6Addresses || []

    // Disassociate existing IPv6 addresses
    if (ipv6Addresses.length > 0) {
      const ipv6ToRemove = ipv6Addresses
        .map((addr) => addr.Ipv6Address)
        .filter((addr): addr is string => addr !== undefined)
      if (ipv6ToRemove.length > 0) {
        await ec2
          .unassignIpv6Addresses({
            NetworkInterfaceId: networkInterfaceId,
            Ipv6Addresses: ipv6ToRemove,
          })
          .promise()
      }
      console.log(`[${timestamp}] Old IPv6 addresses disassociated: ${ipv6ToRemove.join(', ')}`)
    }

    // Assign a new IPv6 address
    const newIpv6Address = await ec2
      .assignIpv6Addresses({
        NetworkInterfaceId: networkInterfaceId,
        Ipv6AddressCount: 1,
      })
      .promise()

    console.log(`[${timestamp}] New IPv6 address assigned: ${newIpv6Address.AssignedIpv6Addresses![0]}`)
  } catch (error) {
    console.error(`[${timestamp}] Error assigning IPv6 address: ${error}`)
  }
}

// Run the function every hour
setInterval(assignNewIPv6, 120 * 60 * 1000)
