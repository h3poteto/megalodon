namespace Entity {
	export type Sub = {
		// For Image, Gifv, and Video
		width?: number;
		height?: number;
		size?: string;
		aspect?: number;

		// For Gifv and Video
		frame_rate?: string;

		// For Audio, Gifv, and Video
		duration?: number;
		bitrate?: number;
	};

	export type Focus = {
		x: number;
		y: number;
	};

	export type Meta = {
		original?: Sub;
		small?: Sub;
		focus?: Focus;
		length?: string;
		duration?: number;
		fps?: number;
		size?: string;
		width?: number;
		height?: number;
		aspect?: number;
		audio_encode?: string;
		audio_bitrate?: string;
		audio_channel?: string;
	};

	export type Attachment = {
		id: string;
		type: "unknown" | "image" | "gifv" | "video" | "audio";
		url: string;
		remote_url: string | null;
		preview_url: string | null;
		text_url: string | null;
		meta: Meta | null;
		description: string | null;
		blurhash: string | null;
	};
}
