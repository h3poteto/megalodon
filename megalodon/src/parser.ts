import { EventEmitter } from "events";
import Entity from "./entity";

/**
 * Parser
 * Parse response data in streaming.
 **/
export class Parser extends EventEmitter {
	private message: string;

	constructor() {
		super();
		this.message = "";
	}

	public parse(chunk: string) {
		// skip heartbeats
		if (chunk === ":thump\n") {
			this.emit("heartbeat", {});
			return;
		}

		this.message += chunk;
		chunk = this.message;

		const size: number = chunk.length;
		let start = 0;
		let offset = 0;
		let curr: string | undefined;
		let next: string | undefined;

		while (offset < size) {
			curr = chunk[offset];
			next = chunk[offset + 1];

			if (curr === "\n" && next === "\n") {
				const piece: string = chunk.slice(start, offset);

				offset += 2;
				start = offset;

				if (!piece.length) continue; // empty object

				const root: Array<string> = piece.split("\n");

				// should never happen, as long as mastodon doesn't change API messages
				if (root.length !== 2) continue;

				// remove event and data markers
				const event: string = root[0].substr(7);
				const data: string = root[1].substr(6);

				let jsonObj = {};
				try {
					jsonObj = JSON.parse(data);
				} catch (err) {
					// delete event does not have json object
					if (event !== "delete") {
						this.emit(
							"error",
							new Error(
								`Error parsing API reply: '${piece}', error message: '${err}'`,
							),
						);
						continue;
					}
				}
				switch (event) {
					case "update":
						this.emit("update", jsonObj as Entity.Status);
						break;
					case "notification":
						this.emit("notification", jsonObj as Entity.Notification);
						break;
					case "conversation":
						this.emit("conversation", jsonObj as Entity.Conversation);
						break;
					case "delete":
						// When delete, data is an ID of the deleted status
						this.emit("delete", data);
						break;
					default:
						this.emit(
							"error",
							new Error(`Unknown event has received: ${event}`),
						);
						continue;
				}
			}
			offset++;
		}
		this.message = chunk.slice(start, size);
	}
}
