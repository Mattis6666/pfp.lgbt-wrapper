[![npm](https://img.shields.io/npm/v/pfp.lgbt-wrapper.svg)](https://www.npmjs.com/package/pfp.lgbt-wrapper)
[![npm](https://img.shields.io/npm/dt/pfp.lgbt-wrapper.svg?maxAge=3600)](https://www.npmjs.com/package/pfp.lgbt-wrapper)
[![install size](https://packagephobia.now.sh/badge?p=pfp.lgbt-wrapper)](https://packagephobia.now.sh/result?p=pfp.lgbt-wrapper)

# pfp.lgbt Wrapper

## Installation

```
npm i pfp.lgbt-wrapper
```

Unofficial wrapper for [pfp.lgbt](https://pfp.lgbt)!

## Usage

#### Get all available flags

Returns `Promise<Object>`

```ts
getFlags();
```

#### Get a flag's image

Returns `Promise<Buffer>`

```ts
getFlag(flag);
```

#### Lgbtify an image

Returns `Promise<Buffer>`

Static

```js
createStatic(
	image, // The image to lgbtify. A Buffer or an image url
	flag, // The Pride flag to add. A valid Pride flag
	type, // The effect type. Any of circle | overlay | square | background - Defaults to circle
	style, // The effect style. Any of solid | gradient - Defaults to solid
	format, // The output format. Any of jpg | png - Defaults to png
	alpha // The effect's alpha
);
```

Animated

```js
createAnimated(
	image,
	flag,
	type, // Any of circle | square - Defaults to circle
	alpha
);
```

## Examples

#### Javascript

```js
const PfPLGBT = require('pfp.lgbt-wrapper');
const fs = require('fs');

const pfp = new PfPLGBT();

async function example() {
	pfp.getFlags().then(console.log);

	await pfp.getFlag('pan').then(result => fs.writeFileSync('./panFlag.png', result));

	pfp.createStatic(fs.readFileSync('./panFlag.png'), 'pride').then(result => fs.writeFileSync('./staticImage.png', result));

	pfp.createAnimated(fs.readFileSync('./panFlag.png'), 'pride', 'square', 100).then(result => fs.writeFileSync('./animatedImage.gif', result));
}

example();
```

#### Typescript

```ts
import PfPLGBT from 'pfp.lgbt-wrapper';
import * as fs from 'fs';

const pfp = new PfPLGBT();

async function example() {
	pfp.getFlags().then(console.log);

	await pfp.getFlag('pan').then(result => fs.writeFileSync('./panFlag.png', result));

	pfp.createStatic(fs.readFileSync('./panFlag.png'), 'pride').then(result => fs.writeFileSync('./staticImage.png', result));

	pfp.createAnimated(fs.readFileSync('./panFlag.png'), 'pride', 'square', 100).then(result => fs.writeFileSync('./animatedImage.gif', result));
}

example();
```

## License

    pfp.lgbt-wrapper, an unofficial wrapper for pfp.lgbt
    Copyright (C) 2020 VenNeptury

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
