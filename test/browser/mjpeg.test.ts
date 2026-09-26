import { expect, test } from 'vitest';
import { registerMjpegDecoder } from '@mediabunny/mjpeg';
import { Input } from '../../src/input.js';
import { UrlSource } from '../../src/source.js';
import { ALL_FORMATS } from '../../src/input-format.js';
import { assert } from '../../src/misc.js';
import { VideoSampleSink } from '../../src/media-sink.js';

// TODO: Do mjpa and mjpb - with and without huffman tables in the jpegs. check if that works
test.concurrent('mjpeg reading', async () => {
	const input = new Input({
		source: new UrlSource('/mjpeg.mov'),
		formats: ALL_FORMATS,
	});

	const videoTrack = (await input.getPrimaryVideoTrack())!;
	expect(await videoTrack.getCodec()).toBe('mjpeg');
	expect(await videoTrack.getCodedWidth()).toBe(640);
	expect(await videoTrack.getCodedHeight()).toBe(360);
});

test.concurrent('decodes mjpeg frames', async () => {
	registerMjpegDecoder();
	const input = new Input({
		source: new UrlSource('/mjpeg.mov'),
		formats: ALL_FORMATS,
	});

	const videoTrack = (await input.getPrimaryVideoTrack())!;
	const sink = new VideoSampleSink(videoTrack);

	const firstSample = await sink.getSample(0);
	expect(firstSample?.codedWidth).toBe(640);
	expect(firstSample?.codedHeight).toBe(360);
	expect(firstSample?.allocationSize()).toBeGreaterThan(0);
});

// test.concurrent('ProRes transmuxing into MOV', { timeout: 20_000 }, async () => {
// 	using input = new Input({
// 		source: new UrlSource(SAMPLE_URL),
// 		formats: ALL_FORMATS,
// 	});

// 	const output = new Output({
// 		format: new MovOutputFormat(),
// 		target: new BufferTarget(),
// 	});

// 	const conversion = await Conversion.init({
// 		input,
// 		output,
// 		audio: {
// 			discard: true,
// 		},
// 		trim: {
// 			end: 0.5,
// 		},
// 	});
// 	await conversion.execute();

// 	using newInput = new Input({
// 		source: new BufferSource(output.target.buffer!),
// 		formats: ALL_FORMATS,
// 	});

// 	const videoTrack = (await newInput.getPrimaryVideoTrack())!;
// 	expect(await videoTrack.getCodec()).toBe('prores');
// 	expect((await videoTrack.computePacketStats()).packetCount).toBe(15);

// 	const decoderConfig = (await videoTrack.getDecoderConfig())!;
// 	expect(decoderConfig.codec).toBe('apch');
// 	expect(decoderConfig.description).toBeUndefined();
// });

// test.concurrent('ProRes transmuxing into MKV', { timeout: 20_000 }, async () => {
// 	using input = new Input({
// 		source: new UrlSource(SAMPLE_URL),
// 		formats: ALL_FORMATS,
// 	});

// 	const output = new Output({
// 		format: new MkvOutputFormat(),
// 		target: new BufferTarget(),
// 	});

// 	const conversion = await Conversion.init({
// 		input,
// 		output,
// 		audio: {
// 			discard: true,
// 		},
// 		trim: {
// 			end: 0.5,
// 		},
// 	});
// 	await conversion.execute();

// 	// No 'icpf' means the frame container atom headers were successfully stripped from the ProRes packets
// 	let str = new TextDecoder('ascii').decode(output.target.buffer!);
// 	expect(str.includes('icpf')).toBe(false);

// 	using newInput = new Input({
// 		source: new BufferSource(output.target.buffer!),
// 		formats: ALL_FORMATS,
// 	});

// 	const videoTrack = (await newInput.getPrimaryVideoTrack())!;
// 	expect(await videoTrack.getCodec()).toBe('prores');
// 	expect((await videoTrack.computePacketStats()).packetCount).toBe(15);

// 	const decoderConfig = (await videoTrack.getDecoderConfig())!;
// 	expect(decoderConfig.codec).toBe('apch');
// 	expect(decoderConfig.description).toBeUndefined();

// 	const sink = new EncodedPacketSink(videoTrack);
// 	const firstPacket = await sink.getFirstPacket();
// 	assert(firstPacket);

// 	// The frame container atom headers are added back when reading out the packets
// 	str = new TextDecoder('ascii').decode(firstPacket.data);
// 	expect(str.includes('icpf')).toBe(true);
// });

// test('Custom coder registration', { timeout: 20_000 }, async () => {
// 	using input = new Input({
// 		source: new UrlSource(SAMPLE_URL),
// 		formats: ALL_FORMATS,
// 	});

// 	const videoTrack = (await input.getPrimaryVideoTrack())!;
// 	expect(await videoTrack.getCodec()).toBe('prores');

// 	// Without a registered decoder, there's no way to decode ProRes in this environment
// 	expect(await videoTrack.canDecode()).toBe(false);

// 	registerProresDecoder();

// 	expect(await videoTrack.canDecode()).toBe(true);
// });

// test('ProRes decoding', { timeout: 20_000 }, async () => {
// 	registerProresDecoder();

// 	using input = new Input({
// 		source: new UrlSource(SAMPLE_URL),
// 		formats: ALL_FORMATS,
// 	});

// 	const videoTrack = (await input.getPrimaryVideoTrack())!;
// 	const firstTimestamp = await videoTrack.getFirstTimestamp();

// 	const sink = new VideoSampleSink(videoTrack);
// 	using sample = await sink.getSample(firstTimestamp);
// 	assert(sample);

// 	expect(sample.timestamp).toBe(firstTimestamp);
// 	expect(sample.duration).toBeGreaterThan(0);

// 	expect(sample.displayWidth).toBe(1920);
// 	expect(sample.displayHeight).toBe(1080);
// 	expect(sample.codedWidth).toBe(1920);
// 	expect(sample.codedHeight).toBe(1080); // Technically a lie but the field is ill-defined
// 	expect(sample.visibleRect).toEqual({
// 		left: 0,
// 		top: 0,
// 		width: 1920,
// 		height: 1080,
// 	});
// 	expect(sample.format).toBe('I422P10');

// 	const allocationSize = sample.allocationSize();
// 	expect(allocationSize).toBeGreaterThan(0);

// 	const pixels = new Uint8Array(allocationSize);
// 	await sample.copyTo(pixels);
// 	expect(pixels.some(byte => byte !== 0)).toBe(true);
// });
