import FormData = require('form-data');
import fetch, { RequestInfo, RequestInit } from 'node-fetch';

export class PfP {
	private readonly baseUrl = 'https://api.pfp.lgbt/v3/';
	rateLimit = false;
	rateLimitEnd: number = 0;
	resetTimeout?: ReturnType<typeof setTimeout>;

	private _fetch(url: RequestInfo, init?: RequestInit, type?: 'json'): Promise<Object>;
	private _fetch(url: RequestInfo, init?: RequestInit, type?: 'img'): Promise<Buffer>;
	private _fetch(url: RequestInfo, init?: RequestInit, type: 'img' | 'json' = 'json') {
		return new Promise((resolve, reject) => {
			if (this.rateLimit) reject('Rate limit reached!');

			fetch(url, init).then(async res => {
				const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
				let rateLimitReset: number | string | null = res.headers.get('x-ratelimit-reset');

				if (rateLimitRemaining === '0') {
					this.rateLimit = true;

					const currentTimeStamp = Date.now();
					rateLimitReset = rateLimitReset ? parseInt(rateLimitReset) * 1000 : currentTimeStamp + 5000;
					this.rateLimitEnd = rateLimitReset;

					if (this.resetTimeout) clearTimeout(this.resetTimeout);
					this.resetTimeout = setTimeout(() => (this.rateLimit = false), rateLimitReset - currentTimeStamp);
				}

				if (res.status > 299 || res.status < 200) reject(`${res.status}: ${res.statusText}`);
				try {
					if (type === 'img') await res.buffer().then(resolve);
					else if (type === 'json') await res.json().then(resolve);
					else reject(`${type} is not a valid mime type`);
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	private _fetchImage(url: string, buf: Buffer, alpha?: number) {
		const data = new FormData();
		data.append('file', buf, 'image.png');
		if (alpha) data.append('alpha', alpha);

		return this._fetch(
			url,
			{
				method: 'POST',
				body: data,
				headers: { ...data.getHeaders() }
			},
			'img'
		);
	}

	getFlags(): Promise<FlagResponse> {
		return this._fetch(this.baseUrl + 'flags', {}, 'json') as Promise<FlagResponse>;
	}

	getFlag(flag: PrideFlags = 'pride') {
		return this._fetch(this.baseUrl + 'icon/' + flag, {}, 'img');
	}

	createStatic(
		image: Buffer,
		flag: PrideFlags,
		type: 'circle' | 'overlay' | 'square' | 'background' = 'circle',
		style: 'solid' | 'gradient' = 'solid',
		format: 'jpg' | 'png' = 'png',
		alpha?: number
	) {
		const url = `${this.baseUrl}image/static/${type}/${style}/${flag}.${format}`;
		return this._fetchImage(url, image, alpha);
	}

	createAnimated(image: Buffer, flag: PrideFlags, type: 'circle' | 'square' = 'circle', alpha?: number) {
		const url = `${this.baseUrl}image/animated/${type}/${flag}`;
		return this._fetchImage(url, image, alpha);
	}
}

type PrideFlags =
	| 'abrosexual'
	| 'ace'
	| 'agender'
	| 'aromantic'
	| 'bi'
	| 'genderfluid'
	| 'genderqueer'
	| 'intersex'
	| 'lesbian'
	| 'nb'
	| 'pan'
	| 'poc'
	| 'pride'
	| 'trans';

type FlagResponse = {
	[key in PrideFlags]: { defaultAlpha: number; tooltip: string };
};
