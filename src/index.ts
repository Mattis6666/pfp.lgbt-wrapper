import FormData = require('form-data');
import fetch, { RequestInfo, RequestInit } from 'node-fetch';

export class PfP {
	readonly #baseUrl = 'https://api.pfp.lgbt/v3/';
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

	private _urlToBuf(url: string) {
		return fetch(url)
			.then(res => res.buffer())
			.catch(() => null);
	}
	/**
	 * Get an object containing all valid flags and their defaults
	 * @returns `Promise<FlagResponse>`
	 */
	getFlags(): Promise<FlagResponse> {
		return this._fetch(this.#baseUrl + 'flags', {}, 'json') as Promise<FlagResponse>;
	}

	/**
	 * Get an image of the provided flag
	 * @param flag The target flag. You can get a list of all flags with the `getFlags()` method
	 * @returns `Promise<Buffer>`
	 */
	getFlag(flag: PrideFlags = 'pride') {
		return this._fetch(this.#baseUrl + 'icon/' + flag, {}, 'img');
	}

	/**
	 * Create a static lgbtifed image
	 * @param image Buffer/Url of the image to lgbtify
	 * @param flag The Pride flag to add
	 * @param type The effect type
	 * @param style The effect style
	 * @param format The format of the resulting image
	 * @param alpha The alpha the effect will have
	 * @returns `Promise<Buffer>`
	 */
	async createStatic(
		image: Buffer | string,
		flag: PrideFlags,
		type: 'circle' | 'overlay' | 'square' | 'background' = 'circle',
		style: 'solid' | 'gradient' = 'solid',
		format: 'jpg' | 'png' = 'png',
		alpha?: number
	) {
		const url = `${this.#baseUrl}image/static/${type}/${style}/${flag}.${format}`;
		if (!(image instanceof Buffer)) image = (await this._urlToBuf(image)) as Buffer;
		if (!image) throw new Error('Invalid image provided');

		return this._fetchImage(url, image, alpha);
	}

	/**
	 * Create an animated lgbtifed image
	 * @param image Buffer/Url of the image to lgbtify
	 * @param flag The Pride flag to add
	 * @param type The effect type
	 * @param alpha The alpha the effect will have
	 * @returns `Promise<Buffer>`
	 */
	async createAnimated(image: Buffer | string, flag: PrideFlags, type: 'circle' | 'square' = 'circle', alpha?: number) {
		const url = `${this.#baseUrl}image/animated/${type}/${flag}`;

		if (!(image instanceof Buffer)) image = (await this._urlToBuf(image)) as Buffer;
		if (!image) throw new Error('Invalid image provided');

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
