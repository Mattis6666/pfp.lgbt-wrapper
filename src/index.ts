import FormData = require('form-data');
import fetch, { RequestInfo, RequestInit } from 'node-fetch';
import { writeFileSync } from 'fs';

export class PfP {
	private readonly baseUrl = 'https://api.pfp.lgbt/v3/';
	rateLimit = false;
	rateLimitEnd: number = 0;

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
					rateLimitReset = rateLimitReset ? parseInt(rateLimitReset) : Date.now() + 5000;
					this.rateLimitEnd = rateLimitReset;

					setTimeout(() => (this.rateLimit = false), rateLimitReset - Date.now());
				}

				if (res.status > 299 || res.status < 200) reject(`${res.status}: ${res.statusText}`);
				try {
					if (type === 'img') await res.buffer().then(buf => resolve(buf));
					else if (type === 'json') await res.json().then(json => resolve(json));
					else reject(`${type} is not a valid mime type`);
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	private async _fetchImage(url: string, buf: Buffer, alpha?: number) {
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

	async createStatic(
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

	async createAnimated(image: Buffer, flag: PrideFlags, type: 'circle' | 'square' = 'circle', alpha?: number) {
		const url = `${this.baseUrl}image/animated/${type}/${flag}`;
		return this._fetchImage(url, image, alpha);
	}
}

async function main() {
	const test = new PfP();
	const img = await fetch('https://cdn.discordapp.com/attachments/587142594497085451/721859760491724880/unknown.png').then(res => res.buffer());
	await test.createStatic(img, 'pan', 'circle', 'solid', 'png', 10).then(res => writeFileSync('./test.png', res));
	await test.createStatic(img, 'pan', 'circle', 'solid', 'png', 10).then(res => writeFileSync('./test2.png', res));
	// await test.createStatic(img, 'pan', 'circle', 'solid', 'png', 10).then(res => writeFileSync('./test2.png', res));
	test.getFlag('pan');
	test.getFlags();
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

main();
