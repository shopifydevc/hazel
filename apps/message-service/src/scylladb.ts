import { Client } from "cassandra-driver"
import { Effect } from "effect"

export class ScyllaService extends Effect.Service<ScyllaService>()("ScyllaService", {
	effect: Effect.gen(function* (_) {
		const client = new Client({
			contactPoints: ["127.0.0.1:9042"],
			localDataCenter: "datacenter1",
			keyspace: "chat",
		})

		yield* Effect.promise(() => client.connect())

		yield* Effect.addFinalizer(() => Effect.promise(() => client.shutdown()))

		const execute = (query: string, params?: any[]) =>
			Effect.tryPromise({
				try: () => client.execute(query, params),
				catch: (error) => new Error(`Database error: ${error}`),
			})

		return { client, execute }
	}),
	dependencies: [],
}) {}
