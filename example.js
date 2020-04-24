const protoLoader = require('@grpc/proto-loader')
const grpc = require('@grpc/grpc-js')

let serverConnections = 0;

const protoPath = __dirname + '/v1.proto'
const protoOptions = {keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
}

function setupServer(recordSpan) {
  const packageDefinition = protoLoader.loadSync(
    protoPath,
    protoOptions,
  )
  const infiniteTracingService = grpc.loadPackageDefinition(packageDefinition).com.newrelic.trace.v1

  const server = new grpc.Server()
  server.addService(
    infiniteTracingService.IngestService.service,
    {recordSpan: recordSpan}
  )

  return new Promise((resolve, reject)=>{
    server.bindAsync(
      'localhost:0',
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          reject(err)
        }
        server.start()
        resolve(port)
      }
    )
  })
}

const recordSpan = (stream) => {
  serverConnections++

  // drain reads to make sure everything finishes properly
  stream.on('data', () => {})

  // detach as soon as we connect
  // end the stream -- expect this sends back a STATUS OK
  stream.end()
}

const callRecordSpanAndGetCallStream = (protoPath, protoOptions, endpoint) => {
  const packageDefinition = protoLoader.loadSync(protoPath, protoOptions)

  const serviceDefinition = grpc.loadPackageDefinition(
    packageDefinition
  ).com.newrelic.trace.v1

  const credentials = grpc.credentials.createInsecure()
  const client = new serviceDefinition.IngestService(
    endpoint,
    credentials
  )
  const metadata = new grpc.Metadata()
  const stream = client.recordSpan(metadata)

  return stream
}

const main = async () => {
  const serverPort = await setupServer(recordSpan)
  const callStream = callRecordSpanAndGetCallStream(protoPath,protoOptions,'localhost:'+serverPort)

  callStream.on('status', (grpcStatus) => {
    console.log(grpcStatus)
  })
}
main()

