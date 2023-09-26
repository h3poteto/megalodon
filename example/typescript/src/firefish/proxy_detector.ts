import { detector, ProxyConfig } from "megalodon";

const BASE_URL: string = process.env.FIREFISH_URL!;

const proxy: ProxyConfig = {
	host: process.env.PROXY_HOST!,
	port: parseInt(process.env.PROXY_PORT!),
	protocol: process.env.PROXY_PROTOCOL! as
		| "http"
		| "https"
		| "socks4"
		| "socks4a"
		| "socks5",
};

detector(BASE_URL, proxy).then((res) => {
	console.log(res);
});
