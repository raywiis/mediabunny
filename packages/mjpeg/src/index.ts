/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CustomVideoDecoder, EncodedPacket, Logging, registerDecoder, VideoCodec, VideoSample } from 'mediabunny';
import { assert } from '../../../src/misc';

const MJPEG_LOADED_SYMBOL = Symbol.for('@mediabunny/mjpeg loaded');
if ((globalThis as Record<symbol, unknown>)[MJPEG_LOADED_SYMBOL]) {
	Logging._error(
		'[WARNING]\n@mediabunny/prores was loaded twice.'
		+ ' This will likely cause the decoder not to work correctly.'
		+ ' Check if multiple dependencies are importing different versions of @mediabunny/prores,'
		+ ' or if something is being bundled incorrectly.',
	);
}
(globalThis as Record<symbol, unknown>)[MJPEG_LOADED_SYMBOL] = true;

class MjpegDecoder extends CustomVideoDecoder {
	canvas: OffscreenCanvas | null = null;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static override supports(codec: VideoCodec, config: VideoDecoderConfig): boolean {
		return codec === 'mjpeg';
	}

	async init() {
		if (typeof VideoFrame !== 'undefined') {
			// TODO Maybe do some init?
		}

		assert(this.config.codedWidth && this.config.codedHeight);
		this.canvas = new OffscreenCanvas(this.config.codedWidth, this.config.codedHeight);
	}

	async decode(packet: EncodedPacket) {
		const buffer = packet.data;

		// @ts-expect-error Deving
		const blob = new Blob([buffer], { type: 'image/jpeg' });
		const bitmap = await createImageBitmap(blob);
		const frame = new VideoFrame(bitmap, { timestamp: packet.timestamp });
		const sample = new VideoSample(frame, { timestamp: packet.timestamp });
		this.onSample(sample);
	}

	flush() {
		// return new Promise<void>(() => {});
		// TOOD: maybe do something?
	}

	close() {
		// return new Promise<void>(() => {});
		// TODO: Cleanup
	}
}

let registered = false;

/**
 * Registers an Apple ProRes decoder which Mediabunny will then use automatically when applicable. Make sure to call
 * this function before starting any decoding task.
 *
 * @group \@mediabunny/prores
 * @public
 */
export const registerMjpegDecoder = () => {
	if (registered) {
		return;
	}
	registered = true;

	registerDecoder(MjpegDecoder);
};
