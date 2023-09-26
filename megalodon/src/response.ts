type Response<T = any> = {
	data: T;
	status: number;
	statusText: string;
	headers: any;
};

export default Response;
