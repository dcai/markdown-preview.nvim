//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __toCommonJS = (mod) => __hasOwnProp.call(mod, "module.exports") ? mod["module.exports"] : __copyProps(__defProp({}, "__esModule", { value: true }), mod);
//#endregion
let node_fs = require("node:fs");
node_fs = __toESM(node_fs);
let node_os = require("node:os");
node_os = __toESM(node_os);
let node_path = require("node:path");
node_path = __toESM(node_path);
let node_child_process = require("node:child_process");
node_child_process = __toESM(node_child_process);
//#region ../node_modules/@msgpack/msgpack/dist.esm/utils/utf8.mjs
function utf8Count(str) {
	const strLength = str.length;
	let byteLength = 0;
	let pos = 0;
	while (pos < strLength) {
		let value = str.charCodeAt(pos++);
		if ((value & 4294967168) === 0) {
			byteLength++;
			continue;
		} else if ((value & 4294965248) === 0) byteLength += 2;
		else {
			if (value >= 55296 && value <= 56319) {
				if (pos < strLength) {
					const extra = str.charCodeAt(pos);
					if ((extra & 64512) === 56320) {
						++pos;
						value = ((value & 1023) << 10) + (extra & 1023) + 65536;
					}
				}
			}
			if ((value & 4294901760) === 0) byteLength += 3;
			else byteLength += 4;
		}
	}
	return byteLength;
}
function utf8EncodeJs(str, output, outputOffset) {
	const strLength = str.length;
	let offset = outputOffset;
	let pos = 0;
	while (pos < strLength) {
		let value = str.charCodeAt(pos++);
		if ((value & 4294967168) === 0) {
			output[offset++] = value;
			continue;
		} else if ((value & 4294965248) === 0) output[offset++] = value >> 6 & 31 | 192;
		else {
			if (value >= 55296 && value <= 56319) {
				if (pos < strLength) {
					const extra = str.charCodeAt(pos);
					if ((extra & 64512) === 56320) {
						++pos;
						value = ((value & 1023) << 10) + (extra & 1023) + 65536;
					}
				}
			}
			if ((value & 4294901760) === 0) {
				output[offset++] = value >> 12 & 15 | 224;
				output[offset++] = value >> 6 & 63 | 128;
			} else {
				output[offset++] = value >> 18 & 7 | 240;
				output[offset++] = value >> 12 & 63 | 128;
				output[offset++] = value >> 6 & 63 | 128;
			}
		}
		output[offset++] = value & 63 | 128;
	}
}
function utf8EncodeTE(str, output, outputOffset) {
	sharedTextEncoder.encodeInto(str, output.subarray(outputOffset));
}
function utf8Encode(str, output, outputOffset) {
	if (str.length > TEXT_ENCODER_THRESHOLD) utf8EncodeTE(str, output, outputOffset);
	else utf8EncodeJs(str, output, outputOffset);
}
function utf8DecodeJs(bytes, inputOffset, byteLength) {
	let offset = inputOffset;
	const end = offset + byteLength;
	const units = [];
	let result = "";
	while (offset < end) {
		const byte1 = bytes[offset++];
		if ((byte1 & 128) === 0) units.push(byte1);
		else if ((byte1 & 224) === 192) {
			const byte2 = bytes[offset++] & 63;
			units.push((byte1 & 31) << 6 | byte2);
		} else if ((byte1 & 240) === 224) {
			const byte2 = bytes[offset++] & 63;
			const byte3 = bytes[offset++] & 63;
			units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
		} else if ((byte1 & 248) === 240) {
			const byte2 = bytes[offset++] & 63;
			const byte3 = bytes[offset++] & 63;
			const byte4 = bytes[offset++] & 63;
			let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
			if (unit > 65535) {
				unit -= 65536;
				units.push(unit >>> 10 & 1023 | 55296);
				unit = 56320 | unit & 1023;
			}
			units.push(unit);
		} else units.push(byte1);
		if (units.length >= CHUNK_SIZE) {
			result += String.fromCharCode(...units);
			units.length = 0;
		}
	}
	if (units.length > 0) result += String.fromCharCode(...units);
	return result;
}
function utf8DecodeTD(bytes, inputOffset, byteLength) {
	const stringBytes = bytes.subarray(inputOffset, inputOffset + byteLength);
	return sharedTextDecoder.decode(stringBytes);
}
function utf8Decode(bytes, inputOffset, byteLength) {
	if (byteLength > TEXT_DECODER_THRESHOLD) return utf8DecodeTD(bytes, inputOffset, byteLength);
	else return utf8DecodeJs(bytes, inputOffset, byteLength);
}
var sharedTextEncoder, TEXT_ENCODER_THRESHOLD, CHUNK_SIZE, sharedTextDecoder, TEXT_DECODER_THRESHOLD;
var init_utf8 = __esmMin((() => {
	sharedTextEncoder = new TextEncoder();
	TEXT_ENCODER_THRESHOLD = 50;
	CHUNK_SIZE = 4096;
	sharedTextDecoder = new TextDecoder();
	TEXT_DECODER_THRESHOLD = 200;
}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/ExtData.mjs
var ExtData;
var init_ExtData = __esmMin((() => {
	ExtData = class {
		type;
		data;
		constructor(type, data) {
			this.type = type;
			this.data = data;
		}
	};
}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/DecodeError.mjs
var DecodeError;
var init_DecodeError = __esmMin((() => {
	DecodeError = class DecodeError extends Error {
		constructor(message) {
			super(message);
			const proto = Object.create(DecodeError.prototype);
			Object.setPrototypeOf(this, proto);
			Object.defineProperty(this, "name", {
				configurable: true,
				enumerable: false,
				value: DecodeError.name
			});
		}
	};
}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/utils/int.mjs
function setUint64(view, offset, value) {
	const high = value / 4294967296;
	const low = value;
	view.setUint32(offset, high);
	view.setUint32(offset + 4, low);
}
function setInt64(view, offset, value) {
	const high = Math.floor(value / 4294967296);
	const low = value;
	view.setUint32(offset, high);
	view.setUint32(offset + 4, low);
}
function getInt64(view, offset) {
	const high = view.getInt32(offset);
	const low = view.getUint32(offset + 4);
	return high * 4294967296 + low;
}
function getUint64(view, offset) {
	const high = view.getUint32(offset);
	const low = view.getUint32(offset + 4);
	return high * 4294967296 + low;
}
var init_int = __esmMin((() => {}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/timestamp.mjs
function encodeTimeSpecToTimestamp({ sec, nsec }) {
	if (sec >= 0 && nsec >= 0 && sec <= TIMESTAMP64_MAX_SEC) {
		if (nsec === 0 && sec <= TIMESTAMP32_MAX_SEC) {
			const rv = /* @__PURE__ */ new Uint8Array(4);
			new DataView(rv.buffer).setUint32(0, sec);
			return rv;
		} else {
			const secHigh = sec / 4294967296;
			const secLow = sec & 4294967295;
			const rv = /* @__PURE__ */ new Uint8Array(8);
			const view = new DataView(rv.buffer);
			view.setUint32(0, nsec << 2 | secHigh & 3);
			view.setUint32(4, secLow);
			return rv;
		}
	} else {
		const rv = /* @__PURE__ */ new Uint8Array(12);
		const view = new DataView(rv.buffer);
		view.setUint32(0, nsec);
		setInt64(view, 4, sec);
		return rv;
	}
}
function encodeDateToTimeSpec(date) {
	const msec = date.getTime();
	const sec = Math.floor(msec / 1e3);
	const nsec = (msec - sec * 1e3) * 1e6;
	const nsecInSec = Math.floor(nsec / 1e9);
	return {
		sec: sec + nsecInSec,
		nsec: nsec - nsecInSec * 1e9
	};
}
function encodeTimestampExtension(object) {
	if (object instanceof Date) return encodeTimeSpecToTimestamp(encodeDateToTimeSpec(object));
	else return null;
}
function decodeTimestampToTimeSpec(data) {
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	switch (data.byteLength) {
		case 4: return {
			sec: view.getUint32(0),
			nsec: 0
		};
		case 8: {
			const nsec30AndSecHigh2 = view.getUint32(0);
			const secLow32 = view.getUint32(4);
			return {
				sec: (nsec30AndSecHigh2 & 3) * 4294967296 + secLow32,
				nsec: nsec30AndSecHigh2 >>> 2
			};
		}
		case 12: return {
			sec: getInt64(view, 4),
			nsec: view.getUint32(0)
		};
		default: throw new DecodeError(`Unrecognized data size for timestamp (expected 4, 8, or 12): ${data.length}`);
	}
}
function decodeTimestampExtension(data) {
	const timeSpec = decodeTimestampToTimeSpec(data);
	return /* @__PURE__ */ new Date(timeSpec.sec * 1e3 + timeSpec.nsec / 1e6);
}
var TIMESTAMP32_MAX_SEC, TIMESTAMP64_MAX_SEC, timestampExtension;
var init_timestamp = __esmMin((() => {
	init_DecodeError();
	init_int();
	TIMESTAMP32_MAX_SEC = 4294967295;
	TIMESTAMP64_MAX_SEC = 17179869183;
	timestampExtension = {
		type: -1,
		encode: encodeTimestampExtension,
		decode: decodeTimestampExtension
	};
}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/ExtensionCodec.mjs
var ExtensionCodec;
var init_ExtensionCodec = __esmMin((() => {
	init_ExtData();
	init_timestamp();
	ExtensionCodec = class ExtensionCodec {
		static defaultCodec = new ExtensionCodec();
		__brand;
		builtInEncoders = [];
		builtInDecoders = [];
		encoders = [];
		decoders = [];
		constructor() {
			this.register(timestampExtension);
		}
		register({ type, encode, decode }) {
			if (type >= 0) {
				this.encoders[type] = encode;
				this.decoders[type] = decode;
			} else {
				const index = -1 - type;
				this.builtInEncoders[index] = encode;
				this.builtInDecoders[index] = decode;
			}
		}
		tryToEncode(object, context) {
			for (let i = 0; i < this.builtInEncoders.length; i++) {
				const encodeExt = this.builtInEncoders[i];
				if (encodeExt != null) {
					const data = encodeExt(object, context);
					if (data != null) {
						const type = -1 - i;
						return new ExtData(type, data);
					}
				}
			}
			for (let i = 0; i < this.encoders.length; i++) {
				const encodeExt = this.encoders[i];
				if (encodeExt != null) {
					const data = encodeExt(object, context);
					if (data != null) return new ExtData(i, data);
				}
			}
			if (object instanceof ExtData) return object;
			return null;
		}
		decode(data, type, context) {
			const decodeExt = type < 0 ? this.builtInDecoders[-1 - type] : this.decoders[type];
			if (decodeExt) return decodeExt(data, type, context);
			else return new ExtData(type, data);
		}
	};
}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/utils/typedArrays.mjs
function isArrayBufferLike(buffer) {
	return buffer instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && buffer instanceof SharedArrayBuffer;
}
function ensureUint8Array(buffer) {
	if (buffer instanceof Uint8Array) return buffer;
	else if (ArrayBuffer.isView(buffer)) return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
	else if (isArrayBufferLike(buffer)) return new Uint8Array(buffer);
	else return Uint8Array.from(buffer);
}
var init_typedArrays = __esmMin((() => {})), Encoder;
var init_Encoder = __esmMin((() => {
	init_utf8();
	init_ExtensionCodec();
	init_int();
	init_typedArrays();
	Encoder = class Encoder {
		extensionCodec;
		context;
		useBigInt64;
		maxDepth;
		initialBufferSize;
		sortKeys;
		forceFloat32;
		ignoreUndefined;
		forceIntegerToFloat;
		pos;
		view;
		bytes;
		entered = false;
		constructor(options) {
			this.extensionCodec = options?.extensionCodec ?? ExtensionCodec.defaultCodec;
			this.context = options?.context;
			this.useBigInt64 = options?.useBigInt64 ?? false;
			this.maxDepth = options?.maxDepth ?? 100;
			this.initialBufferSize = options?.initialBufferSize ?? 2048;
			this.sortKeys = options?.sortKeys ?? false;
			this.forceFloat32 = options?.forceFloat32 ?? false;
			this.ignoreUndefined = options?.ignoreUndefined ?? false;
			this.forceIntegerToFloat = options?.forceIntegerToFloat ?? false;
			this.pos = 0;
			this.view = new DataView(new ArrayBuffer(this.initialBufferSize));
			this.bytes = new Uint8Array(this.view.buffer);
		}
		clone() {
			return new Encoder({
				extensionCodec: this.extensionCodec,
				context: this.context,
				useBigInt64: this.useBigInt64,
				maxDepth: this.maxDepth,
				initialBufferSize: this.initialBufferSize,
				sortKeys: this.sortKeys,
				forceFloat32: this.forceFloat32,
				ignoreUndefined: this.ignoreUndefined,
				forceIntegerToFloat: this.forceIntegerToFloat
			});
		}
		reinitializeState() {
			this.pos = 0;
		}
		/**
		* This is almost equivalent to {@link Encoder#encode}, but it returns an reference of the encoder's internal buffer and thus much faster than {@link Encoder#encode}.
		*
		* @returns Encodes the object and returns a shared reference the encoder's internal buffer.
		*/
		encodeSharedRef(object) {
			if (this.entered) return this.clone().encodeSharedRef(object);
			try {
				this.entered = true;
				this.reinitializeState();
				this.doEncode(object, 1);
				return this.bytes.subarray(0, this.pos);
			} finally {
				this.entered = false;
			}
		}
		/**
		* @returns Encodes the object and returns a copy of the encoder's internal buffer.
		*/
		encode(object) {
			if (this.entered) return this.clone().encode(object);
			try {
				this.entered = true;
				this.reinitializeState();
				this.doEncode(object, 1);
				return this.bytes.slice(0, this.pos);
			} finally {
				this.entered = false;
			}
		}
		doEncode(object, depth) {
			if (depth > this.maxDepth) throw new Error(`Too deep objects in depth ${depth}`);
			if (object == null) this.encodeNil();
			else if (typeof object === "boolean") this.encodeBoolean(object);
			else if (typeof object === "number") {
				if (!this.forceIntegerToFloat) this.encodeNumber(object);
				else this.encodeNumberAsFloat(object);
			} else if (typeof object === "string") this.encodeString(object);
			else if (this.useBigInt64 && typeof object === "bigint") this.encodeBigInt64(object);
			else this.encodeObject(object, depth);
		}
		ensureBufferSizeToWrite(sizeToWrite) {
			const requiredSize = this.pos + sizeToWrite;
			if (this.view.byteLength < requiredSize) this.resizeBuffer(requiredSize * 2);
		}
		resizeBuffer(newSize) {
			const newBuffer = new ArrayBuffer(newSize);
			const newBytes = new Uint8Array(newBuffer);
			const newView = new DataView(newBuffer);
			newBytes.set(this.bytes);
			this.view = newView;
			this.bytes = newBytes;
		}
		encodeNil() {
			this.writeU8(192);
		}
		encodeBoolean(object) {
			if (object === false) this.writeU8(194);
			else this.writeU8(195);
		}
		encodeNumber(object) {
			if (!this.forceIntegerToFloat && Number.isSafeInteger(object)) {
				if (object >= 0) {
					if (object < 128) this.writeU8(object);
					else if (object < 256) {
						this.writeU8(204);
						this.writeU8(object);
					} else if (object < 65536) {
						this.writeU8(205);
						this.writeU16(object);
					} else if (object < 4294967296) {
						this.writeU8(206);
						this.writeU32(object);
					} else if (!this.useBigInt64) {
						this.writeU8(207);
						this.writeU64(object);
					} else this.encodeNumberAsFloat(object);
				} else if (object >= -32) this.writeU8(224 | object + 32);
				else if (object >= -128) {
					this.writeU8(208);
					this.writeI8(object);
				} else if (object >= -32768) {
					this.writeU8(209);
					this.writeI16(object);
				} else if (object >= -2147483648) {
					this.writeU8(210);
					this.writeI32(object);
				} else if (!this.useBigInt64) {
					this.writeU8(211);
					this.writeI64(object);
				} else this.encodeNumberAsFloat(object);
			} else this.encodeNumberAsFloat(object);
		}
		encodeNumberAsFloat(object) {
			if (this.forceFloat32) {
				this.writeU8(202);
				this.writeF32(object);
			} else {
				this.writeU8(203);
				this.writeF64(object);
			}
		}
		encodeBigInt64(object) {
			if (object >= BigInt(0)) {
				this.writeU8(207);
				this.writeBigUint64(object);
			} else {
				this.writeU8(211);
				this.writeBigInt64(object);
			}
		}
		writeStringHeader(byteLength) {
			if (byteLength < 32) this.writeU8(160 + byteLength);
			else if (byteLength < 256) {
				this.writeU8(217);
				this.writeU8(byteLength);
			} else if (byteLength < 65536) {
				this.writeU8(218);
				this.writeU16(byteLength);
			} else if (byteLength < 4294967296) {
				this.writeU8(219);
				this.writeU32(byteLength);
			} else throw new Error(`Too long string: ${byteLength} bytes in UTF-8`);
		}
		encodeString(object) {
			const maxHeaderSize = 5;
			const byteLength = utf8Count(object);
			this.ensureBufferSizeToWrite(maxHeaderSize + byteLength);
			this.writeStringHeader(byteLength);
			utf8Encode(object, this.bytes, this.pos);
			this.pos += byteLength;
		}
		encodeObject(object, depth) {
			const ext = this.extensionCodec.tryToEncode(object, this.context);
			if (ext != null) this.encodeExtension(ext);
			else if (Array.isArray(object)) this.encodeArray(object, depth);
			else if (ArrayBuffer.isView(object)) this.encodeBinary(object);
			else if (typeof object === "object") this.encodeMap(object, depth);
			else throw new Error(`Unrecognized object: ${Object.prototype.toString.apply(object)}`);
		}
		encodeBinary(object) {
			const size = object.byteLength;
			if (size < 256) {
				this.writeU8(196);
				this.writeU8(size);
			} else if (size < 65536) {
				this.writeU8(197);
				this.writeU16(size);
			} else if (size < 4294967296) {
				this.writeU8(198);
				this.writeU32(size);
			} else throw new Error(`Too large binary: ${size}`);
			const bytes = ensureUint8Array(object);
			this.writeU8a(bytes);
		}
		encodeArray(object, depth) {
			const size = object.length;
			if (size < 16) this.writeU8(144 + size);
			else if (size < 65536) {
				this.writeU8(220);
				this.writeU16(size);
			} else if (size < 4294967296) {
				this.writeU8(221);
				this.writeU32(size);
			} else throw new Error(`Too large array: ${size}`);
			for (const item of object) this.doEncode(item, depth + 1);
		}
		countWithoutUndefined(object, keys) {
			let count = 0;
			for (const key of keys) if (object[key] !== void 0) count++;
			return count;
		}
		encodeMap(object, depth) {
			const keys = Object.keys(object);
			if (this.sortKeys) keys.sort();
			const size = this.ignoreUndefined ? this.countWithoutUndefined(object, keys) : keys.length;
			if (size < 16) this.writeU8(128 + size);
			else if (size < 65536) {
				this.writeU8(222);
				this.writeU16(size);
			} else if (size < 4294967296) {
				this.writeU8(223);
				this.writeU32(size);
			} else throw new Error(`Too large map object: ${size}`);
			for (const key of keys) {
				const value = object[key];
				if (!(this.ignoreUndefined && value === void 0)) {
					this.encodeString(key);
					this.doEncode(value, depth + 1);
				}
			}
		}
		encodeExtension(ext) {
			if (typeof ext.data === "function") {
				const data = ext.data(this.pos + 6);
				const size = data.length;
				if (size >= 4294967296) throw new Error(`Too large extension object: ${size}`);
				this.writeU8(201);
				this.writeU32(size);
				this.writeI8(ext.type);
				this.writeU8a(data);
				return;
			}
			const size = ext.data.length;
			if (size === 1) this.writeU8(212);
			else if (size === 2) this.writeU8(213);
			else if (size === 4) this.writeU8(214);
			else if (size === 8) this.writeU8(215);
			else if (size === 16) this.writeU8(216);
			else if (size < 256) {
				this.writeU8(199);
				this.writeU8(size);
			} else if (size < 65536) {
				this.writeU8(200);
				this.writeU16(size);
			} else if (size < 4294967296) {
				this.writeU8(201);
				this.writeU32(size);
			} else throw new Error(`Too large extension object: ${size}`);
			this.writeI8(ext.type);
			this.writeU8a(ext.data);
		}
		writeU8(value) {
			this.ensureBufferSizeToWrite(1);
			this.view.setUint8(this.pos, value);
			this.pos++;
		}
		writeU8a(values) {
			const size = values.length;
			this.ensureBufferSizeToWrite(size);
			this.bytes.set(values, this.pos);
			this.pos += size;
		}
		writeI8(value) {
			this.ensureBufferSizeToWrite(1);
			this.view.setInt8(this.pos, value);
			this.pos++;
		}
		writeU16(value) {
			this.ensureBufferSizeToWrite(2);
			this.view.setUint16(this.pos, value);
			this.pos += 2;
		}
		writeI16(value) {
			this.ensureBufferSizeToWrite(2);
			this.view.setInt16(this.pos, value);
			this.pos += 2;
		}
		writeU32(value) {
			this.ensureBufferSizeToWrite(4);
			this.view.setUint32(this.pos, value);
			this.pos += 4;
		}
		writeI32(value) {
			this.ensureBufferSizeToWrite(4);
			this.view.setInt32(this.pos, value);
			this.pos += 4;
		}
		writeF32(value) {
			this.ensureBufferSizeToWrite(4);
			this.view.setFloat32(this.pos, value);
			this.pos += 4;
		}
		writeF64(value) {
			this.ensureBufferSizeToWrite(8);
			this.view.setFloat64(this.pos, value);
			this.pos += 8;
		}
		writeU64(value) {
			this.ensureBufferSizeToWrite(8);
			setUint64(this.view, this.pos, value);
			this.pos += 8;
		}
		writeI64(value) {
			this.ensureBufferSizeToWrite(8);
			setInt64(this.view, this.pos, value);
			this.pos += 8;
		}
		writeBigUint64(value) {
			this.ensureBufferSizeToWrite(8);
			this.view.setBigUint64(this.pos, value);
			this.pos += 8;
		}
		writeBigInt64(value) {
			this.ensureBufferSizeToWrite(8);
			this.view.setBigInt64(this.pos, value);
			this.pos += 8;
		}
	};
}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/encode.mjs
/**
* It encodes `value` in the MessagePack format and
* returns a byte buffer.
*
* The returned buffer is a slice of a larger `ArrayBuffer`, so you have to use its `#byteOffset` and `#byteLength` in order to convert it to another typed arrays including NodeJS `Buffer`.
*/
function encode(value, options) {
	return new Encoder(options).encodeSharedRef(value);
}
var init_encode = __esmMin((() => {
	init_Encoder();
}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/utils/prettyByte.mjs
function prettyByte(byte) {
	return `${byte < 0 ? "-" : ""}0x${Math.abs(byte).toString(16).padStart(2, "0")}`;
}
var init_prettyByte = __esmMin((() => {}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/CachedKeyDecoder.mjs
var DEFAULT_MAX_KEY_LENGTH, DEFAULT_MAX_LENGTH_PER_KEY, CachedKeyDecoder;
var init_CachedKeyDecoder = __esmMin((() => {
	init_utf8();
	DEFAULT_MAX_KEY_LENGTH = 16;
	DEFAULT_MAX_LENGTH_PER_KEY = 16;
	CachedKeyDecoder = class {
		hit = 0;
		miss = 0;
		caches;
		maxKeyLength;
		maxLengthPerKey;
		constructor(maxKeyLength = DEFAULT_MAX_KEY_LENGTH, maxLengthPerKey = DEFAULT_MAX_LENGTH_PER_KEY) {
			this.maxKeyLength = maxKeyLength;
			this.maxLengthPerKey = maxLengthPerKey;
			this.caches = [];
			for (let i = 0; i < this.maxKeyLength; i++) this.caches.push([]);
		}
		canBeCached(byteLength) {
			return byteLength > 0 && byteLength <= this.maxKeyLength;
		}
		find(bytes, inputOffset, byteLength) {
			const records = this.caches[byteLength - 1];
			FIND_CHUNK: for (const record of records) {
				const recordBytes = record.bytes;
				for (let j = 0; j < byteLength; j++) if (recordBytes[j] !== bytes[inputOffset + j]) continue FIND_CHUNK;
				return record.str;
			}
			return null;
		}
		store(bytes, value) {
			const records = this.caches[bytes.length - 1];
			const record = {
				bytes,
				str: value
			};
			if (records.length >= this.maxLengthPerKey) records[Math.random() * records.length | 0] = record;
			else records.push(record);
		}
		decode(bytes, inputOffset, byteLength) {
			const cachedValue = this.find(bytes, inputOffset, byteLength);
			if (cachedValue != null) {
				this.hit++;
				return cachedValue;
			}
			this.miss++;
			const str = utf8DecodeJs(bytes, inputOffset, byteLength);
			const slicedCopyOfBytes = Uint8Array.prototype.slice.call(bytes, inputOffset, inputOffset + byteLength);
			this.store(slicedCopyOfBytes, str);
			return str;
		}
	};
}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/Decoder.mjs
var STATE_ARRAY, STATE_MAP_KEY, STATE_MAP_VALUE, mapKeyConverter, StackPool, HEAD_BYTE_REQUIRED, EMPTY_VIEW, EMPTY_BYTES, MORE_DATA, sharedCachedKeyDecoder, Decoder;
var init_Decoder = __esmMin((() => {
	init_prettyByte();
	init_ExtensionCodec();
	init_int();
	init_utf8();
	init_typedArrays();
	init_CachedKeyDecoder();
	init_DecodeError();
	STATE_ARRAY = "array";
	STATE_MAP_KEY = "map_key";
	STATE_MAP_VALUE = "map_value";
	mapKeyConverter = (key) => {
		if (typeof key === "string" || typeof key === "number") return key;
		throw new DecodeError("The type of key must be string or number but " + typeof key);
	};
	StackPool = class {
		stack = [];
		stackHeadPosition = -1;
		get length() {
			return this.stackHeadPosition + 1;
		}
		top() {
			return this.stack[this.stackHeadPosition];
		}
		pushArrayState(size) {
			const state = this.getUninitializedStateFromPool();
			state.type = STATE_ARRAY;
			state.position = 0;
			state.size = size;
			state.array = new Array(size);
		}
		pushMapState(size) {
			const state = this.getUninitializedStateFromPool();
			state.type = STATE_MAP_KEY;
			state.readCount = 0;
			state.size = size;
			state.map = {};
		}
		getUninitializedStateFromPool() {
			this.stackHeadPosition++;
			if (this.stackHeadPosition === this.stack.length) this.stack.push({
				type: void 0,
				size: 0,
				array: void 0,
				position: 0,
				readCount: 0,
				map: void 0,
				key: null
			});
			return this.stack[this.stackHeadPosition];
		}
		release(state) {
			if (this.stack[this.stackHeadPosition] !== state) throw new Error("Invalid stack state. Released state is not on top of the stack.");
			if (state.type === STATE_ARRAY) {
				const partialState = state;
				partialState.size = 0;
				partialState.array = void 0;
				partialState.position = 0;
				partialState.type = void 0;
			}
			if (state.type === STATE_MAP_KEY || state.type === STATE_MAP_VALUE) {
				const partialState = state;
				partialState.size = 0;
				partialState.map = void 0;
				partialState.readCount = 0;
				partialState.type = void 0;
			}
			this.stackHeadPosition--;
		}
		reset() {
			this.stack.length = 0;
			this.stackHeadPosition = -1;
		}
	};
	HEAD_BYTE_REQUIRED = -1;
	EMPTY_VIEW = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(0));
	EMPTY_BYTES = new Uint8Array(EMPTY_VIEW.buffer);
	try {
		EMPTY_VIEW.getInt8(0);
	} catch (e) {
		if (!(e instanceof RangeError)) throw new Error("This module is not supported in the current JavaScript engine because DataView does not throw RangeError on out-of-bounds access");
	}
	MORE_DATA = /* @__PURE__ */ new RangeError("Insufficient data");
	sharedCachedKeyDecoder = new CachedKeyDecoder();
	Decoder = class Decoder {
		extensionCodec;
		context;
		useBigInt64;
		rawStrings;
		maxStrLength;
		maxBinLength;
		maxArrayLength;
		maxMapLength;
		maxExtLength;
		keyDecoder;
		mapKeyConverter;
		totalPos = 0;
		pos = 0;
		view = EMPTY_VIEW;
		bytes = EMPTY_BYTES;
		headByte = HEAD_BYTE_REQUIRED;
		stack = new StackPool();
		entered = false;
		constructor(options) {
			this.extensionCodec = options?.extensionCodec ?? ExtensionCodec.defaultCodec;
			this.context = options?.context;
			this.useBigInt64 = options?.useBigInt64 ?? false;
			this.rawStrings = options?.rawStrings ?? false;
			this.maxStrLength = options?.maxStrLength ?? 4294967295;
			this.maxBinLength = options?.maxBinLength ?? 4294967295;
			this.maxArrayLength = options?.maxArrayLength ?? 4294967295;
			this.maxMapLength = options?.maxMapLength ?? 4294967295;
			this.maxExtLength = options?.maxExtLength ?? 4294967295;
			this.keyDecoder = options?.keyDecoder !== void 0 ? options.keyDecoder : sharedCachedKeyDecoder;
			this.mapKeyConverter = options?.mapKeyConverter ?? mapKeyConverter;
		}
		clone() {
			return new Decoder({
				extensionCodec: this.extensionCodec,
				context: this.context,
				useBigInt64: this.useBigInt64,
				rawStrings: this.rawStrings,
				maxStrLength: this.maxStrLength,
				maxBinLength: this.maxBinLength,
				maxArrayLength: this.maxArrayLength,
				maxMapLength: this.maxMapLength,
				maxExtLength: this.maxExtLength,
				keyDecoder: this.keyDecoder
			});
		}
		reinitializeState() {
			this.totalPos = 0;
			this.headByte = HEAD_BYTE_REQUIRED;
			this.stack.reset();
		}
		setBuffer(buffer) {
			const bytes = ensureUint8Array(buffer);
			this.bytes = bytes;
			this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
			this.pos = 0;
		}
		appendBuffer(buffer) {
			if (this.headByte === HEAD_BYTE_REQUIRED && !this.hasRemaining(1)) this.setBuffer(buffer);
			else {
				const remainingData = this.bytes.subarray(this.pos);
				const newData = ensureUint8Array(buffer);
				const newBuffer = new Uint8Array(remainingData.length + newData.length);
				newBuffer.set(remainingData);
				newBuffer.set(newData, remainingData.length);
				this.setBuffer(newBuffer);
			}
		}
		hasRemaining(size) {
			return this.view.byteLength - this.pos >= size;
		}
		createExtraByteError(posToShow) {
			const { view, pos } = this;
			return /* @__PURE__ */ new RangeError(`Extra ${view.byteLength - pos} of ${view.byteLength} byte(s) found at buffer[${posToShow}]`);
		}
		/**
		* @throws {@link DecodeError}
		* @throws {@link RangeError}
		*/
		decode(buffer) {
			if (this.entered) return this.clone().decode(buffer);
			try {
				this.entered = true;
				this.reinitializeState();
				this.setBuffer(buffer);
				const object = this.doDecodeSync();
				if (this.hasRemaining(1)) throw this.createExtraByteError(this.pos);
				return object;
			} finally {
				this.entered = false;
			}
		}
		*decodeMulti(buffer) {
			if (this.entered) {
				yield* this.clone().decodeMulti(buffer);
				return;
			}
			try {
				this.entered = true;
				this.reinitializeState();
				this.setBuffer(buffer);
				while (this.hasRemaining(1)) yield this.doDecodeSync();
			} finally {
				this.entered = false;
			}
		}
		async decodeAsync(stream) {
			if (this.entered) return this.clone().decodeAsync(stream);
			try {
				this.entered = true;
				let decoded = false;
				let object;
				for await (const buffer of stream) {
					if (decoded) {
						this.entered = false;
						throw this.createExtraByteError(this.totalPos);
					}
					this.appendBuffer(buffer);
					try {
						object = this.doDecodeSync();
						decoded = true;
					} catch (e) {
						if (!(e instanceof RangeError)) throw e;
					}
					this.totalPos += this.pos;
				}
				if (decoded) {
					if (this.hasRemaining(1)) throw this.createExtraByteError(this.totalPos);
					return object;
				}
				const { headByte, pos, totalPos } = this;
				throw new RangeError(`Insufficient data in parsing ${prettyByte(headByte)} at ${totalPos} (${pos} in the current buffer)`);
			} finally {
				this.entered = false;
			}
		}
		decodeArrayStream(stream) {
			return this.decodeMultiAsync(stream, true);
		}
		decodeStream(stream) {
			return this.decodeMultiAsync(stream, false);
		}
		async *decodeMultiAsync(stream, isArray) {
			if (this.entered) {
				yield* this.clone().decodeMultiAsync(stream, isArray);
				return;
			}
			try {
				this.entered = true;
				let isArrayHeaderRequired = isArray;
				let arrayItemsLeft = -1;
				for await (const buffer of stream) {
					if (isArray && arrayItemsLeft === 0) throw this.createExtraByteError(this.totalPos);
					this.appendBuffer(buffer);
					if (isArrayHeaderRequired) {
						arrayItemsLeft = this.readArraySize();
						isArrayHeaderRequired = false;
						this.complete();
					}
					try {
						while (true) {
							yield this.doDecodeSync();
							if (--arrayItemsLeft === 0) break;
						}
					} catch (e) {
						if (!(e instanceof RangeError)) throw e;
					}
					this.totalPos += this.pos;
				}
			} finally {
				this.entered = false;
			}
		}
		doDecodeSync() {
			DECODE: while (true) {
				const headByte = this.readHeadByte();
				let object;
				if (headByte >= 224) object = headByte - 256;
				else if (headByte < 192) {
					if (headByte < 128) object = headByte;
					else if (headByte < 144) {
						const size = headByte - 128;
						if (size !== 0) {
							this.pushMapState(size);
							this.complete();
							continue DECODE;
						} else object = {};
					} else if (headByte < 160) {
						const size = headByte - 144;
						if (size !== 0) {
							this.pushArrayState(size);
							this.complete();
							continue DECODE;
						} else object = [];
					} else {
						const byteLength = headByte - 160;
						object = this.decodeString(byteLength, 0);
					}
				} else if (headByte === 192) object = null;
				else if (headByte === 194) object = false;
				else if (headByte === 195) object = true;
				else if (headByte === 202) object = this.readF32();
				else if (headByte === 203) object = this.readF64();
				else if (headByte === 204) object = this.readU8();
				else if (headByte === 205) object = this.readU16();
				else if (headByte === 206) object = this.readU32();
				else if (headByte === 207) {
					if (this.useBigInt64) object = this.readU64AsBigInt();
					else object = this.readU64();
				} else if (headByte === 208) object = this.readI8();
				else if (headByte === 209) object = this.readI16();
				else if (headByte === 210) object = this.readI32();
				else if (headByte === 211) {
					if (this.useBigInt64) object = this.readI64AsBigInt();
					else object = this.readI64();
				} else if (headByte === 217) {
					const byteLength = this.lookU8();
					object = this.decodeString(byteLength, 1);
				} else if (headByte === 218) {
					const byteLength = this.lookU16();
					object = this.decodeString(byteLength, 2);
				} else if (headByte === 219) {
					const byteLength = this.lookU32();
					object = this.decodeString(byteLength, 4);
				} else if (headByte === 220) {
					const size = this.readU16();
					if (size !== 0) {
						this.pushArrayState(size);
						this.complete();
						continue DECODE;
					} else object = [];
				} else if (headByte === 221) {
					const size = this.readU32();
					if (size !== 0) {
						this.pushArrayState(size);
						this.complete();
						continue DECODE;
					} else object = [];
				} else if (headByte === 222) {
					const size = this.readU16();
					if (size !== 0) {
						this.pushMapState(size);
						this.complete();
						continue DECODE;
					} else object = {};
				} else if (headByte === 223) {
					const size = this.readU32();
					if (size !== 0) {
						this.pushMapState(size);
						this.complete();
						continue DECODE;
					} else object = {};
				} else if (headByte === 196) {
					const size = this.lookU8();
					object = this.decodeBinary(size, 1);
				} else if (headByte === 197) {
					const size = this.lookU16();
					object = this.decodeBinary(size, 2);
				} else if (headByte === 198) {
					const size = this.lookU32();
					object = this.decodeBinary(size, 4);
				} else if (headByte === 212) object = this.decodeExtension(1, 0);
				else if (headByte === 213) object = this.decodeExtension(2, 0);
				else if (headByte === 214) object = this.decodeExtension(4, 0);
				else if (headByte === 215) object = this.decodeExtension(8, 0);
				else if (headByte === 216) object = this.decodeExtension(16, 0);
				else if (headByte === 199) {
					const size = this.lookU8();
					object = this.decodeExtension(size, 1);
				} else if (headByte === 200) {
					const size = this.lookU16();
					object = this.decodeExtension(size, 2);
				} else if (headByte === 201) {
					const size = this.lookU32();
					object = this.decodeExtension(size, 4);
				} else throw new DecodeError(`Unrecognized type byte: ${prettyByte(headByte)}`);
				this.complete();
				const stack = this.stack;
				while (stack.length > 0) {
					const state = stack.top();
					if (state.type === STATE_ARRAY) {
						state.array[state.position] = object;
						state.position++;
						if (state.position === state.size) {
							object = state.array;
							stack.release(state);
						} else continue DECODE;
					} else if (state.type === STATE_MAP_KEY) {
						if (object === "__proto__") throw new DecodeError("The key __proto__ is not allowed");
						state.key = this.mapKeyConverter(object);
						state.type = STATE_MAP_VALUE;
						continue DECODE;
					} else {
						state.map[state.key] = object;
						state.readCount++;
						if (state.readCount === state.size) {
							object = state.map;
							stack.release(state);
						} else {
							state.key = null;
							state.type = STATE_MAP_KEY;
							continue DECODE;
						}
					}
				}
				return object;
			}
		}
		readHeadByte() {
			if (this.headByte === HEAD_BYTE_REQUIRED) this.headByte = this.readU8();
			return this.headByte;
		}
		complete() {
			this.headByte = HEAD_BYTE_REQUIRED;
		}
		readArraySize() {
			const headByte = this.readHeadByte();
			switch (headByte) {
				case 220: return this.readU16();
				case 221: return this.readU32();
				default: if (headByte < 160) return headByte - 144;
				else throw new DecodeError(`Unrecognized array type byte: ${prettyByte(headByte)}`);
			}
		}
		pushMapState(size) {
			if (size > this.maxMapLength) throw new DecodeError(`Max length exceeded: map length (${size}) > maxMapLengthLength (${this.maxMapLength})`);
			this.stack.pushMapState(size);
		}
		pushArrayState(size) {
			if (size > this.maxArrayLength) throw new DecodeError(`Max length exceeded: array length (${size}) > maxArrayLength (${this.maxArrayLength})`);
			this.stack.pushArrayState(size);
		}
		decodeString(byteLength, headerOffset) {
			if (!this.rawStrings || this.stateIsMapKey()) return this.decodeUtf8String(byteLength, headerOffset);
			return this.decodeBinary(byteLength, headerOffset);
		}
		/**
		* @throws {@link RangeError}
		*/
		decodeUtf8String(byteLength, headerOffset) {
			if (byteLength > this.maxStrLength) throw new DecodeError(`Max length exceeded: UTF-8 byte length (${byteLength}) > maxStrLength (${this.maxStrLength})`);
			if (this.bytes.byteLength < this.pos + headerOffset + byteLength) throw MORE_DATA;
			const offset = this.pos + headerOffset;
			let object;
			if (this.stateIsMapKey() && this.keyDecoder?.canBeCached(byteLength)) object = this.keyDecoder.decode(this.bytes, offset, byteLength);
			else object = utf8Decode(this.bytes, offset, byteLength);
			this.pos += headerOffset + byteLength;
			return object;
		}
		stateIsMapKey() {
			if (this.stack.length > 0) return this.stack.top().type === STATE_MAP_KEY;
			return false;
		}
		/**
		* @throws {@link RangeError}
		*/
		decodeBinary(byteLength, headOffset) {
			if (byteLength > this.maxBinLength) throw new DecodeError(`Max length exceeded: bin length (${byteLength}) > maxBinLength (${this.maxBinLength})`);
			if (!this.hasRemaining(byteLength + headOffset)) throw MORE_DATA;
			const offset = this.pos + headOffset;
			const object = this.bytes.subarray(offset, offset + byteLength);
			this.pos += headOffset + byteLength;
			return object;
		}
		decodeExtension(size, headOffset) {
			if (size > this.maxExtLength) throw new DecodeError(`Max length exceeded: ext length (${size}) > maxExtLength (${this.maxExtLength})`);
			const extType = this.view.getInt8(this.pos + headOffset);
			const data = this.decodeBinary(size, headOffset + 1);
			return this.extensionCodec.decode(data, extType, this.context);
		}
		lookU8() {
			return this.view.getUint8(this.pos);
		}
		lookU16() {
			return this.view.getUint16(this.pos);
		}
		lookU32() {
			return this.view.getUint32(this.pos);
		}
		readU8() {
			const value = this.view.getUint8(this.pos);
			this.pos++;
			return value;
		}
		readI8() {
			const value = this.view.getInt8(this.pos);
			this.pos++;
			return value;
		}
		readU16() {
			const value = this.view.getUint16(this.pos);
			this.pos += 2;
			return value;
		}
		readI16() {
			const value = this.view.getInt16(this.pos);
			this.pos += 2;
			return value;
		}
		readU32() {
			const value = this.view.getUint32(this.pos);
			this.pos += 4;
			return value;
		}
		readI32() {
			const value = this.view.getInt32(this.pos);
			this.pos += 4;
			return value;
		}
		readU64() {
			const value = getUint64(this.view, this.pos);
			this.pos += 8;
			return value;
		}
		readI64() {
			const value = getInt64(this.view, this.pos);
			this.pos += 8;
			return value;
		}
		readU64AsBigInt() {
			const value = this.view.getBigUint64(this.pos);
			this.pos += 8;
			return value;
		}
		readI64AsBigInt() {
			const value = this.view.getBigInt64(this.pos);
			this.pos += 8;
			return value;
		}
		readF32() {
			const value = this.view.getFloat32(this.pos);
			this.pos += 4;
			return value;
		}
		readF64() {
			const value = this.view.getFloat64(this.pos);
			this.pos += 8;
			return value;
		}
	};
}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/decode.mjs
/**
* It decodes a single MessagePack object in a buffer.
*
* This is a synchronous decoding function.
* See other variants for asynchronous decoding: {@link decodeAsync}, {@link decodeMultiStream}, or {@link decodeArrayStream}.
*
* @throws {@link RangeError} if the buffer is incomplete, including the case where the buffer is empty.
* @throws {@link DecodeError} if the buffer contains invalid data.
*/
function decode(buffer, options) {
	return new Decoder(options).decode(buffer);
}
/**
* It decodes multiple MessagePack objects in a buffer.
* This is corresponding to {@link decodeMultiStream}.
*
* @throws {@link RangeError} if the buffer is incomplete, including the case where the buffer is empty.
* @throws {@link DecodeError} if the buffer contains invalid data.
*/
function decodeMulti(buffer, options) {
	return new Decoder(options).decodeMulti(buffer);
}
var init_decode = __esmMin((() => {
	init_Decoder();
}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/utils/stream.mjs
function isAsyncIterable(object) {
	return object[Symbol.asyncIterator] != null;
}
async function* asyncIterableFromStream(stream) {
	const reader = stream.getReader();
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) return;
			yield value;
		}
	} finally {
		reader.releaseLock();
	}
}
function ensureAsyncIterable(streamLike) {
	if (isAsyncIterable(streamLike)) return streamLike;
	else return asyncIterableFromStream(streamLike);
}
var init_stream = __esmMin((() => {}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/decodeAsync.mjs
/**
* @throws {@link RangeError} if the buffer is incomplete, including the case where the buffer is empty.
* @throws {@link DecodeError} if the buffer contains invalid data.
*/
async function decodeAsync(streamLike, options) {
	const stream = ensureAsyncIterable(streamLike);
	return new Decoder(options).decodeAsync(stream);
}
/**
* @throws {@link RangeError} if the buffer is incomplete, including the case where the buffer is empty.
* @throws {@link DecodeError} if the buffer contains invalid data.
*/
function decodeArrayStream(streamLike, options) {
	const stream = ensureAsyncIterable(streamLike);
	return new Decoder(options).decodeArrayStream(stream);
}
/**
* @throws {@link RangeError} if the buffer is incomplete, including the case where the buffer is empty.
* @throws {@link DecodeError} if the buffer contains invalid data.
*/
function decodeMultiStream(streamLike, options) {
	const stream = ensureAsyncIterable(streamLike);
	return new Decoder(options).decodeStream(stream);
}
var init_decodeAsync = __esmMin((() => {
	init_Decoder();
	init_stream();
}));
//#endregion
//#region ../node_modules/@msgpack/msgpack/dist.esm/index.mjs
var dist_esm_exports = /* @__PURE__ */ __exportAll({
	DecodeError: () => DecodeError,
	Decoder: () => Decoder,
	EXT_TIMESTAMP: () => -1,
	Encoder: () => Encoder,
	ExtData: () => ExtData,
	ExtensionCodec: () => ExtensionCodec,
	decode: () => decode,
	decodeArrayStream: () => decodeArrayStream,
	decodeAsync: () => decodeAsync,
	decodeMulti: () => decodeMulti,
	decodeMultiStream: () => decodeMultiStream,
	decodeTimestampExtension: () => decodeTimestampExtension,
	decodeTimestampToTimeSpec: () => decodeTimestampToTimeSpec,
	encode: () => encode,
	encodeDateToTimeSpec: () => encodeDateToTimeSpec,
	encodeTimeSpecToTimestamp: () => encodeTimeSpecToTimestamp,
	encodeTimestampExtension: () => encodeTimestampExtension
});
var init_dist_esm = __esmMin((() => {
	init_encode();
	init_decode();
	init_decodeAsync();
	init_Decoder();
	init_DecodeError();
	init_Encoder();
	init_ExtensionCodec();
	init_ExtData();
	init_timestamp();
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/utils/error.js
var require_error = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.disconnectedText = void 0;
	exports.shouldIgnore = shouldIgnore;
	exports.disconnectedText = "transport disconnected";
	function shouldIgnore(err) {
		if (err instanceof Error && err.message === exports.disconnectedText) return true;
		return false;
	}
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/utils/constants.js
var require_constants$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isVim = exports.isTester = exports.isCocNvim = void 0;
	exports.isCocNvim = process.env.COC_NVIM === "1";
	exports.isTester = process.env.COC_TESTER === "1";
	exports.isVim = process.env.VIM_NODE_RPC === "1";
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/api/Base.js
var require_Base = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BaseApi = void 0;
	var error_1 = require_error();
	var constants_1 = require_constants$1();
	var BaseApi = class {
		constructor({ data, client }) {
			this.data = data;
			if (client) this.client = client;
			else Object.defineProperty(this, "client", {
				enumerable: false,
				value: this
			});
		}
		get transport() {
			return this.client.transport;
		}
		equals(other) {
			try {
				return String(this.data) === String(other.data);
			} catch (e) {
				return false;
			}
		}
		async request(name, args = [], skipConvert = false, skipErrorLog = false) {
			if (!global.__TEST__) Error.captureStackTrace(args);
			return new Promise((resolve, reject) => {
				let converted = skipConvert ? args : this.getArgsByPrefix(args);
				this.transport.request(name, converted, (err, res) => {
					if (err) {
						let e = new Error(err[1]);
						if (!skipErrorLog && !(0, error_1.shouldIgnore)(e)) {
							e.stack = `Error: request error on "${name}" - ${err[1]}\n` + (args["stack"] ? args["stack"].split(/\r?\n/).slice(3).join("\n") : "");
							this.client.logError(`request error on "${name}"`, converted.map((o) => o === this ? this.data : o), e);
						}
						reject(e);
					} else resolve(res);
				});
			});
		}
		getArgsByPrefix(args) {
			if (this.prefix !== "nvim_" && args[0] !== this) return [constants_1.isVim ? this.data : this, ...args];
			return args;
		}
		/** Retrieves a scoped variable depending on type (using `this.prefix`) */
		getVar(name) {
			return this.request(`${this.prefix}get_var`, [name], false, true).then((res) => res, (_err) => {
				return null;
			});
		}
		setVar(name, value, isNotify = false) {
			if (isNotify) {
				this.notify(`${this.prefix}set_var`, [name, value]);
				return;
			}
			return this.request(`${this.prefix}set_var`, [name, value]);
		}
		/** Delete a scoped variable */
		deleteVar(name) {
			this.notify(`${this.prefix}del_var`, [name]);
		}
		/** Retrieves a scoped option depending on type of `this` */
		getOption(name) {
			return this.request(`${this.prefix}get_option`, [name]);
		}
		setOption(name, value, isNotify) {
			if (isNotify) {
				this.notify(`${this.prefix}set_option`, [name, value]);
				return;
			}
			return this.request(`${this.prefix}set_option`, [name, value]);
		}
		/** `request` is basically the same except you can choose to wait forpromise to be resolved */
		notify(name, args = [], skipConvert = false) {
			this.transport.notify(name, skipConvert ? args : this.getArgsByPrefix(args));
		}
		toJSON() {
			var _a;
			return (_a = this.data) !== null && _a !== void 0 ? _a : 0;
		}
	};
	exports.BaseApi = BaseApi;
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/api/Buffer.js
var require_Buffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Buffer = void 0;
	var constants_1 = require_constants$1();
	var Base_1 = require_Base();
	var Buffer = class extends Base_1.BaseApi {
		constructor() {
			super(...arguments);
			this.prefix = "nvim_buf_";
		}
		/**
		* Attach to buffer to listen to buffer events
		* @param sendBuffer Set to true if the initial notification should contain
		* the whole buffer. If so, the first notification will be a
		* `nvim_buf_lines_event`. Otherwise, the first notification will be
		* a `nvim_buf_changedtick_event`
		*/
		async attach(sendBuffer = false, options = {}) {
			return await this.request(`${this.prefix}attach`, [sendBuffer, options]);
		}
		/**
		* Detach from buffer to stop listening to buffer events
		*/
		async detach() {
			return await this.request(`${this.prefix}detach`, []);
		}
		/** Retrieves a scoped option depending on type of `this` */
		getOption(name) {
			if (constants_1.isCocNvim) return this.request(`nvim_get_option_value`, [name, { buf: this.id }], true);
			return super.getOption(name);
		}
		setOption(name, value, isNotify) {
			if (constants_1.isCocNvim) return this[isNotify ? "notify" : "request"](`nvim_set_option_value`, [
				name,
				value,
				{ buf: this.id }
			], true);
			return this[isNotify ? "notify" : "request"](`${this.prefix}set_option`, [name, value]);
		}
		/**
		* Get the bufnr of Buffer
		*/
		get id() {
			return this.data;
		}
		/** Total number of lines in buffer */
		get length() {
			return this.request(`${this.prefix}line_count`, []);
		}
		/** Get lines in buffer */
		get lines() {
			return this.getLines();
		}
		/** Gets a changed tick of a buffer */
		get changedtick() {
			return this.request(`${this.prefix}get_changedtick`, []);
		}
		get commands() {
			return this.getCommands();
		}
		getCommands(options = {}) {
			return this.request(`${this.prefix}get_commands`, [options]);
		}
		/** Get specific lines of buffer */
		getLines({ start, end, strictIndexing } = {
			start: 0,
			end: -1,
			strictIndexing: true
		}) {
			const indexing = typeof strictIndexing === "undefined" ? true : strictIndexing;
			return this.request(`${this.prefix}get_lines`, [
				start,
				end,
				indexing
			]);
		}
		setLines(lines, opts, notify = false) {
			let { start, end, strictIndexing } = opts !== null && opts !== void 0 ? opts : {};
			start = start !== null && start !== void 0 ? start : 0;
			end = end !== null && end !== void 0 ? end : start + 1;
			const indexing = strictIndexing !== null && strictIndexing !== void 0 ? strictIndexing : true;
			const method = notify ? "notify" : "request";
			return this[method](`${this.prefix}set_lines`, [
				start,
				end,
				indexing,
				typeof lines === "string" ? [lines] : lines
			]);
		}
		/**
		* Set virtual text for a line, works on nvim >= 0.5.0 and vim9
		* @public
		* @param {number} src_id - Source group to use or 0 to use a new group, or -1
		* @param {number} line - Line to annotate with virtual text (zero-indexed)
		* @param {Chunk[]} chunks - List with [text, hl_group]
		* @param {{[index} opts
		* @returns {Promise<number>}
		*/
		setVirtualText(src_id, line, chunks, opts = {}) {
			this.client.call("coc#vtext#add", [
				this.id,
				src_id,
				line,
				chunks,
				opts
			], true);
			return Promise.resolve(src_id);
		}
		/**
		* Removes an ext mark by notification.
		* @public
		* @param {number} ns_id - Namespace id
		* @param {number} id - Extmark id
		*/
		deleteExtMark(ns_id, id) {
			this.notify(`${this.prefix}del_extmark`, [ns_id, id]);
		}
		/**
		* Gets the position (0-indexed) of an extmark.
		* @param {number} ns_id - Namespace id
		* @param {number} id - Extmark id
		* @param {Object} opts - Optional parameters.
		* @returns {Promise<[] | [number, number] | [number, number, ExtmarkDetails]>}
		*/
		async getExtMarkById(ns_id, id, opts = {}) {
			return this.request(`${this.prefix}get_extmark_by_id`, [
				ns_id,
				id,
				opts
			]);
		}
		/**
		* Gets extmarks in "traversal order" from a |charwise| region defined by
		* buffer positions (inclusive, 0-indexed |api-indexing|).
		*
		* Region can be given as (row,col) tuples, or valid extmark ids (whose
		* positions define the bounds). 0 and -1 are understood as (0,0) and (-1,-1)
		* respectively, thus the following are equivalent:
		*
		* nvim_buf_get_extmarks(0, my_ns, 0, -1, {})
		* nvim_buf_get_extmarks(0, my_ns, [0,0], [-1,-1], {})
		* @param {number} ns_id - Namespace id
		* @param {[number, number] | number} start
		* @param {[number, number] | number} end
		* @param {Object} opts
		* @returns {Promise<[number, number, number, ExtmarkDetails?][]>}
		*/
		async getExtMarks(ns_id, start, end, opts = {}) {
			return this.request(`${this.prefix}get_extmarks`, [
				ns_id,
				start,
				end,
				opts
			]);
		}
		/**
		* Creates or updates an extmark by notification, `:h nvim_buf_set_extmark`.
		* @param {number} ns_id
		* @param {number} line
		* @param {number} col
		* @param {ExtmarkOptions} opts
		* @returns {void}
		*/
		setExtMark(ns_id, line, col, opts = {}) {
			this.notify(`${this.prefix}set_extmark`, [
				ns_id,
				line,
				col,
				opts
			]);
		}
		/** Insert lines at `start` index */
		insert(lines, start) {
			return this.setLines(lines, {
				start,
				end: start,
				strictIndexing: true
			});
		}
		/** Replace lines starting at `start` index */
		replace(_lines, start) {
			const lines = typeof _lines === "string" ? [_lines] : _lines;
			return this.setLines(lines, {
				start,
				end: start + lines.length,
				strictIndexing: false
			});
		}
		/** Remove lines at index */
		remove(start, end, strictIndexing = false) {
			return this.setLines([], {
				start,
				end,
				strictIndexing
			});
		}
		/** Append a string or list of lines to end of buffer */
		append(lines) {
			return this.setLines(lines, {
				start: -1,
				end: -1,
				strictIndexing: false
			});
		}
		/** Get buffer name */
		get name() {
			return this.request(`${this.prefix}get_name`, []);
		}
		/** Set current buffer name */
		setName(value) {
			return this.request(`${this.prefix}set_name`, [value]);
		}
		/** Is current buffer valid */
		get valid() {
			return this.request(`${this.prefix}is_valid`, []);
		}
		/** Get mark position given mark name */
		mark(name) {
			return this.request(`${this.prefix}get_mark`, [name]);
		}
		/** Gets keymap */
		getKeymap(mode) {
			return this.request(`${this.prefix}get_keymap`, [mode]);
		}
		/**
		* Add buffer keymap by notification, replace keycodes for expr keymap enabled by default.
		*/
		setKeymap(mode, lhs, rhs, opts = {}) {
			let option = opts.expr ? Object.assign({ replace_keycodes: true }, opts) : opts;
			this.notify(`${this.prefix}set_keymap`, [
				mode,
				lhs,
				rhs,
				option
			]);
		}
		deleteKeymap(mode, lhs) {
			this.notify(`${this.prefix}del_keymap`, [mode, lhs]);
		}
		/**
		* Checks if a buffer is valid and loaded. See |api-buffer| for
		* more info about unloaded buffers.
		*/
		get loaded() {
			return this.request(`${this.prefix}is_loaded`, []);
		}
		/**
		* Returns the byte offset for a line.
		*
		* Line 1 (index=0) has offset 0. UTF-8 bytes are counted. EOL is
		* one byte. 'fileformat' and 'fileencoding' are ignored. The
		* line index just after the last line gives the total byte-count
		* of the buffer. A final EOL byte is counted if it would be
		* written, see 'eol'.
		*
		* Unlike |line2byte()|, throws error for out-of-bounds indexing.
		* Returns -1 for unloaded buffer.
		* @return {Number} Integer byte offset, or -1 for unloaded buffer.
		*/
		getOffset(index) {
			return this.request(`${this.prefix}get_offset`, [index]);
		}
		/**
		* Adds a highlight to buffer.
		*
		* This can be used for plugins which dynamically generate
		* highlights to a buffer (like a semantic highlighter or
		* linter). The function adds a single highlight to a buffer.
		* Unlike matchaddpos() highlights follow changes to line
		* numbering (as lines are inserted/removed above the highlighted
		* line), like signs and marks do.
		*
		* "src_id" is useful for batch deletion/updating of a set of
		* highlights. When called with src_id = 0, an unique source id
		* is generated and returned. Successive calls can pass in it as
		* "src_id" to add new highlights to the same source group. All
		* highlights in the same group can then be cleared with
		* nvim_buf_clear_namespace. If the highlight never will be
		* manually deleted pass in -1 for "src_id".
		*
		* If "hl_group" is the empty string no highlight is added, but a
		* new src_id is still returned. This is useful for an external
		* plugin to synchrounously request an unique src_id at
		* initialization, and later asynchronously add and clear
		* highlights in response to buffer changes.
		*/
		addHighlight({ hlGroup, line, colStart: _start, colEnd: _end, srcId: _srcId }) {
			if (!hlGroup) throw new Error("hlGroup should not empty");
			const colEnd = typeof _end !== "undefined" ? _end : -1;
			const colStart = typeof _start !== "undefined" ? _start : -0;
			const srcId = typeof _srcId !== "undefined" ? _srcId : -1;
			const method = srcId == 0 ? "request" : "notify";
			let res = this[method](`${this.prefix}add_highlight`, [
				srcId,
				hlGroup,
				line,
				colStart,
				colEnd
			]);
			return method === "request" ? res : Promise.resolve(null);
		}
		/**
		* Clear highlights of specified lines.
		* @deprecated use clearNamespace() instead.
		*/
		clearHighlight(args = {}) {
			const { srcId, lineStart, lineEnd } = Object.assign({}, {
				srcId: -1,
				lineStart: 0,
				lineEnd: -1
			}, args);
			return this.notify(`${this.prefix}clear_highlight`, [
				srcId,
				lineStart,
				lineEnd
			]);
		}
		/**
		* Add highlight to ranges by notification.
		* @param {string | number} srcId Unique key or namespace number.
		* @param {string} hlGroup Highlight group.
		* @param {Range[]} ranges List of highlight ranges
		*/
		highlightRanges(srcId, hlGroup, ranges, option) {
			this.client.call("coc#highlight#ranges", [
				this.id,
				srcId,
				hlGroup,
				ranges,
				option !== null && option !== void 0 ? option : {}
			], true);
		}
		/**
		* Clear namespace by id or name.
		* @param key Unique key or namespace number, use -1 for all namespaces
		* @param lineStart Start of line, 0 based, default to 0.
		* @param lineEnd End of line, 0 based, default to -1.
		*/
		clearNamespace(key, lineStart = 0, lineEnd = -1) {
			this.client.call("coc#highlight#clear_highlight", [
				this.id,
				key,
				lineStart,
				lineEnd
			], true);
		}
		/**
		* Add sign to buffer by notification.
		* @param {SignPlaceOption} sign
		* @returns {void}
		*/
		placeSign(sign) {
			let opts = { lnum: sign.lnum };
			if (typeof sign.priority === "number") opts.priority = sign.priority;
			this.client.call("sign_place", [
				sign.id || 0,
				sign.group || "",
				sign.name,
				this.id,
				opts
			], true);
		}
		/**
		* Unplace signs by notification
		*/
		unplaceSign(opts) {
			let details = { buffer: this.id };
			if (opts.id != null) details.id = opts.id;
			this.client.call("sign_unplace", [opts.group || "", details], true);
		}
		/**
		* Get signs by group name or id and lnum.
		* @param {SignPlacedOption} opts
		* @returns {Promise<SignItem[]>}
		*/
		async getSigns(opts) {
			return (await this.client.call("sign_getplaced", [this.id, opts || {}]))[0].signs;
		}
		/**
		* Get highlight items by name space (end inclusive).
		* @param {string} ns Namespace key.
		* @param {number} start 0 based line number.
		* @param {number} end 0 based line number.
		* @returns {Promise<HighlightItem[]>}
		*/
		async getHighlights(ns, start = 0, end = -1) {
			let res = [];
			let arr = await this.client.call("coc#highlight#get_highlights", [
				this.id,
				ns,
				start,
				end
			]);
			for (let item of arr) res.push({
				hlGroup: item[0],
				lnum: item[1],
				colStart: item[2],
				colEnd: item[3],
				id: item[4]
			});
			return res;
		}
		/**
		* Update highlight items by notification.
		* @param {string | number} ns Namespace key or id.
		* @param {HighlightItem[]} highlights Highlight items.
		* @param {HighlightOption} opts Optional options.
		* @returns {void}
		*/
		updateHighlights(ns, highlights, opts = {}) {
			if (typeof opts === "number") {
				this.client.logError("Bad option for buffer.updateHighlights()", /* @__PURE__ */ new Error());
				return;
			}
			let start = typeof opts.start === "number" ? opts.start : 0;
			let end = typeof opts.end === "number" ? opts.end : -1;
			let changedtick = typeof opts.changedtick === "number" ? opts.changedtick : null;
			let priority = typeof opts.priority === "number" ? opts.priority : null;
			let arr = highlights.map((o) => [
				o.hlGroup,
				o.lnum,
				o.colStart,
				o.colEnd,
				o.combine === false ? 0 : 1,
				o.start_incl ? 1 : 0,
				o.end_incl ? 1 : 0
			]);
			if (start == 0 && end == -1) {
				this.client.call("coc#highlight#buffer_update", [
					this.id,
					ns,
					arr,
					priority,
					changedtick
				], true);
				return;
			}
			this.client.call("coc#highlight#update_highlights", [
				this.id,
				ns,
				arr,
				start,
				end,
				priority,
				changedtick
			], true);
		}
		/**
		* Listens to buffer for events
		*/
		listen(eventName, cb, disposables) {
			this.client.attachBufferEvent(this.id, eventName, cb);
			if (disposables) disposables.push({ dispose: () => {
				this.client.detachBufferEvent(this.id, eventName, cb);
			} });
		}
	};
	exports.Buffer = Buffer;
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/api/Tabpage.js
var require_Tabpage = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Tabpage = void 0;
	var Base_1 = require_Base();
	var Tabpage = class extends Base_1.BaseApi {
		constructor() {
			super(...arguments);
			this.prefix = "nvim_tabpage_";
		}
		/**
		* The windowid that not change within a Vim session
		*/
		get id() {
			return this.data;
		}
		/** Returns all windows of tabpage */
		get windows() {
			return this.request(`${this.prefix}list_wins`, []);
		}
		/** Gets the current window of tabpage */
		get window() {
			return this.request(`${this.prefix}get_win`, []);
		}
		/** Is current tabpage valid */
		get valid() {
			return this.request(`${this.prefix}is_valid`, []);
		}
		/** Tabpage number */
		get number() {
			return this.request(`${this.prefix}get_number`, []);
		}
		/** Invalid */
		getOption() {
			throw new Error("Tabpage does not have `getOption`");
		}
		/** Invalid */
		setOption() {
			throw new Error("Tabpage does not have `setOption`");
		}
	};
	exports.Tabpage = Tabpage;
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/api/Window.js
var require_Window = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Window = void 0;
	var constants_1 = require_constants$1();
	var Base_1 = require_Base();
	var Window = class extends Base_1.BaseApi {
		constructor() {
			super(...arguments);
			this.prefix = "nvim_win_";
		}
		/**
		* The windowid that not change within a Vim session
		*/
		get id() {
			return this.data;
		}
		setBuffer(buffer) {
			return this.request(`${this.prefix}set_buf`, [buffer]);
		}
		/** Retrieves a scoped option depending on type of `this` */
		getOption(name) {
			if (constants_1.isCocNvim) return this.request(`nvim_get_option_value`, [name, { win: this.id }], true);
			return super.getOption(name);
		}
		setOption(name, value, isNotify) {
			if (constants_1.isCocNvim) return this[isNotify ? "notify" : "request"](`nvim_set_option_value`, [
				name,
				value,
				{ win: this.id }
			], true);
			return this[isNotify ? "notify" : "request"](`${this.prefix}set_option`, [name, value]);
		}
		/** Get current buffer of window */
		get buffer() {
			return this.request(`${this.prefix}get_buf`, []);
		}
		/** Get the Tabpage that contains the window */
		get tabpage() {
			return this.request(`${this.prefix}get_tabpage`, []);
		}
		/** Get cursor position */
		get cursor() {
			return this.request(`${this.prefix}get_cursor`, []);
		}
		setCursor(pos, isNotify = false) {
			let method = isNotify ? "notify" : "request";
			return this[method](`${this.prefix}set_cursor`, [pos]);
		}
		/** Get window height by number of rows */
		get height() {
			return this.request(`${this.prefix}get_height`, []);
		}
		setHeight(height, isNotify = false) {
			let method = isNotify ? "notify" : "request";
			return this[method](`${this.prefix}set_height`, [height]);
		}
		/** Get window width by number of columns */
		get width() {
			return this.request(`${this.prefix}get_width`, []);
		}
		setWidth(width, isNotify = false) {
			let method = isNotify ? "notify" : "request";
			return this[method](`${this.prefix}set_width`, [width]);
		}
		/** Get window position */
		get position() {
			return this.request(`${this.prefix}get_position`, []);
		}
		/** 0-indexed, on-screen window position(row) in display cells. */
		get row() {
			return this.request(`${this.prefix}get_position`, []).then((position) => position[0]);
		}
		/** 0-indexed, on-screen window position(col) in display cells. */
		get col() {
			return this.request(`${this.prefix}get_position`, []).then((position) => position[1]);
		}
		/** Is window valid */
		get valid() {
			return this.request(`${this.prefix}is_valid`, []);
		}
		/** Get window number */
		get number() {
			return this.request(`${this.prefix}get_number`, []);
		}
		setConfig(options, isNotify) {
			let method = isNotify ? "notify" : "request";
			return this[method](`${this.prefix}set_config`, [options]);
		}
		getConfig() {
			return this.request(`${this.prefix}get_config`, []);
		}
		close(force, isNotify) {
			if (isNotify) {
				this.notify(`${this.prefix}close`, [force]);
				return null;
			}
			return this.request(`${this.prefix}close`, [force]);
		}
		highlightRanges(hlGroup, ranges, priority = 10, isNotify) {
			if (isNotify) {
				this.client.call("coc#highlight#match_ranges", [
					this.id,
					0,
					ranges,
					hlGroup,
					priority
				], true);
				return;
			}
			return this.client.call("coc#highlight#match_ranges", [
				this.id,
				0,
				ranges,
				hlGroup,
				priority
			]);
		}
		/**
		* Clear match by highlight group.
		*/
		clearMatchGroup(hlGroup) {
			this.client.call("coc#window#clear_match_group", [this.id, hlGroup], true);
		}
		/**
		* Clear match by match ids.
		*/
		clearMatches(ids) {
			this.client.call("coc#window#clear_matches", [this.id, ids], true);
		}
	};
	exports.Window = Window;
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/api/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Metadata = exports.ExtType = void 0;
	var Buffer_1 = require_Buffer();
	var Tabpage_1 = require_Tabpage();
	var Window_1 = require_Window();
	var ExtType;
	(function(ExtType) {
		ExtType[ExtType["Buffer"] = 0] = "Buffer";
		ExtType[ExtType["Window"] = 1] = "Window";
		ExtType[ExtType["Tabpage"] = 2] = "Tabpage";
	})(ExtType || (exports.ExtType = ExtType = {}));
	exports.Metadata = [
		{
			constructor: Buffer_1.Buffer,
			name: "Buffer",
			prefix: "nvim_buf_"
		},
		{
			constructor: Window_1.Window,
			name: "Window",
			prefix: "nvim_win_"
		},
		{
			constructor: Tabpage_1.Tabpage,
			name: "Tabpage",
			prefix: "nvim_tabpage_"
		}
	];
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/utils/logger.js
var require_logger$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.level = exports.nullLogger = void 0;
	exports.createLogger = createLogger;
	var fs_1$2 = __importDefault(require("fs"));
	var os_1 = __importDefault(require("os"));
	var path_1 = __importDefault(require("path"));
	var util_1 = require("util");
	exports.nullLogger = {
		debug: () => {},
		info: () => {},
		warn: () => {},
		error: () => {},
		trace: () => {}
	};
	function getLogFile() {
		let file = process.env.NODE_CLIENT_LOG_FILE;
		if (file) return file;
		let dir = process.env.XDG_RUNTIME_DIR;
		if (dir) return path_1.default.join(dir, "node-client.log");
		return path_1.default.join(os_1.default.tmpdir(), `node-client-${process.pid}.log`);
	}
	var debugging = process.env.COC_NODE_CLIENT_DEBUG == "1";
	var LOG_FILE_PATH = getLogFile();
	exports.level = debugging ? "debug" : process.env.NODE_CLIENT_LOG_LEVEL || "info";
	var invalid = !debugging && process.getuid && process.getuid() == 0;
	if (!invalid && !debugging) try {
		fs_1$2.default.mkdirSync(path_1.default.dirname(LOG_FILE_PATH), { recursive: true });
		fs_1$2.default.writeFileSync(LOG_FILE_PATH, "", {
			encoding: "utf8",
			mode: 438
		});
	} catch (_e) {
		invalid = true;
	}
	function toObject(arg) {
		if (arg == null) return arg;
		if (Array.isArray(arg)) return arg.map((o) => toObject(o));
		if (typeof arg == "object" && typeof arg.prefix == "string" && typeof arg.data == "number") return "[" + arg.prefix + arg.data + "]";
		return arg;
	}
	function toString(arg) {
		if (debugging) return (0, util_1.inspect)(arg, {
			depth: null,
			colors: true,
			compact: false
		});
		if (arg == null) return String(arg);
		if (arg instanceof Error) return arg.stack;
		if (typeof arg == "object") return JSON.stringify(arg, null, 2);
		return String(arg);
	}
	var toTwoDigits = (v) => v < 10 ? `0${v}` : v.toString();
	var toThreeDigits = (v) => v < 10 ? `00${v}` : v < 100 ? `0${v}` : v.toString();
	function toTimeString(currentTime) {
		return `${toTwoDigits(currentTime.getHours())}:${toTwoDigits(currentTime.getMinutes())}:${toTwoDigits(currentTime.getSeconds())}.${toThreeDigits(currentTime.getMilliseconds())}`;
	}
	var writableStream;
	var Logger = class {
		constructor(name) {
			this.name = name;
		}
		get stream() {
			if (writableStream) return writableStream;
			if (debugging) writableStream = process.stdout;
			else writableStream = fs_1$2.default.createWriteStream(LOG_FILE_PATH, { encoding: "utf8" });
			return writableStream;
		}
		getText(level, data, meta) {
			let more = "";
			if (meta.length) more = " " + toObject(meta).map((o) => toString(o)).join(", ");
			return `${toTimeString(/* @__PURE__ */ new Date())} ${level.toUpperCase()} [${this.name}] - ${data}${more}\n`;
		}
		debug(data, ...meta) {
			if (exports.level != "debug" || invalid) return;
			this.stream.write(this.getText("debug", data, meta));
		}
		info(data, ...meta) {
			if (invalid) return;
			this.stream.write(this.getText("info", data, meta));
		}
		warn(data, ...meta) {
			if (invalid) return;
			this.stream.write(this.getText("warn", data, meta));
		}
		error(data, ...meta) {
			if (invalid) return;
			(debugging ? process.stderr : this.stream).write(this.getText("error", data, meta));
		}
		trace(data, ...meta) {
			if (exports.level != "trace" || invalid) return;
			this.stream.write(this.getText("trace", data, meta));
		}
	};
	function createLogger(name) {
		return new Logger(name);
	}
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/transport/base.js
var require_base = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var events_1$8 = require("events");
	var logger_1 = require_logger$1();
	var debug = logger_1.level === "debug";
	var logger = (0, logger_1.createLogger)("transport");
	var Transport = class extends events_1$8.EventEmitter {
		constructor(logger, isVim) {
			super();
			this.logger = logger;
			this.isVim = isVim;
			this.pauseLevel = 0;
			this.paused = /* @__PURE__ */ new Map();
		}
		debug(key, ...meta) {
			if (!debug) return;
			logger.debug(key, ...meta);
		}
		debugMessage(msg) {
			if (!debug) return;
			const msgType = msg[0];
			if (msgType === 0) logger.debug("receive request:", msg.slice(1));
			else if (msgType === 1) {} else if (msgType === 2) logger.debug("receive notification:", msg.slice(1));
			else logger.debug("unknown message:", msg);
		}
		pauseNotification() {
			this.pauseLevel = this.pauseLevel + 1;
			this.paused.set(this.pauseLevel, []);
		}
		cancelNotification() {
			let { pauseLevel } = this;
			if (pauseLevel > 0) {
				this.paused.delete(pauseLevel);
				this.pauseLevel = pauseLevel - 1;
			}
		}
		resumeNotification(isNotify = false) {
			let { pauseLevel } = this;
			if (pauseLevel === 0) return isNotify ? null : Promise.resolve([[], null]);
			let obj = {};
			if (!global.__TEST__) Error.captureStackTrace(obj);
			this.pauseLevel = pauseLevel - 1;
			let list = this.paused.get(pauseLevel);
			this.paused.delete(pauseLevel);
			if (list && list.length) return new Promise((resolve, reject) => {
				if (!isNotify) return this.request("nvim_call_atomic", [list], (err, res) => {
					if (err) {
						let e = /* @__PURE__ */ new Error(`call_atomic error: ${err[1]}`);
						e.stack = obj.stack ? obj.stack.replace(/^Error/, `Error: ${e.message}`) : e.stack;
						return reject(e);
					}
					if (Array.isArray(res) && res[1] !== null && res[1] !== void 0) {
						let [index, errType, message] = res[1];
						let [fname, args] = list[index];
						let e = /* @__PURE__ */ new Error(`call_atomic request error on "${fname}": ${message}`);
						e.stack = obj.stack ? obj.stack.replace(/^Error/, `Error: ${e.message}`) : e.stack;
						this.logger.error(`call_atomic request error ${errType} on "${fname}"`, args, message, e);
						return reject(e);
					}
					resolve(res);
				});
				this.notify("nvim_call_atomic", [list]);
				resolve(void 0);
			});
			return isNotify ? null : Promise.resolve([[], void 0]);
		}
	};
	exports.default = Transport;
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/transport/nvim.js
var require_nvim$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NvimTransport = void 0;
	var msgpack_1 = (init_dist_esm(), __toCommonJS(dist_esm_exports));
	var error_1 = require_error();
	var types_1 = require_types();
	var base_1 = __importDefault(require_base());
	var constants_1 = require_constants$1();
	var REQUEST_TIMEOUT = global.__TEST__ || constants_1.isTester ? 3e3 : 0;
	var NvimTransport = class extends base_1.default {
		constructor(logger) {
			super(logger, false);
			this.pending = /* @__PURE__ */ new Map();
			this.nextRequestId = 1;
			this.extensionCodec = this.initializeExtensionCodec();
			this.encoder = new msgpack_1.Encoder({
				extensionCodec: this.extensionCodec,
				ignoreUndefined: true
			});
			this.extEncoder = new msgpack_1.Encoder({ ignoreUndefined: true });
			this.decodeGeneration = 0;
			this.attached = false;
		}
		initializeExtensionCodec() {
			const codec = new msgpack_1.ExtensionCodec();
			types_1.Metadata.forEach(({ constructor }, id) => {
				codec.register({
					type: id,
					encode: (input) => {
						if (input instanceof constructor) return this.extEncoder.encode(input.data);
						return null;
					},
					decode: (data) => new constructor({
						client: this.client,
						data: (0, msgpack_1.decode)(data)
					})
				});
			});
			return codec;
		}
		encodeToBuffer(value) {
			const encoded = this.encoder.encode(value);
			return Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
		}
		parseMessage(msg) {
			if (!this.attached) return;
			const msgType = msg[0];
			this.debugMessage(msg);
			if (msgType === 0) {
				let method = msg[2].toString();
				this.emit("request", method, msg[3], this.createResponse(method, msg[1]));
			} else if (msgType === 1) {
				const id = msg[1];
				const handler = this.pending.get(id);
				if (handler) {
					this.pending.delete(id);
					let err = msg[2];
					if (err && err.length != 2) err = [0, err.toString()];
					handler(err, msg[3]);
				}
			} else if (msgType === 2) this.emit("notification", msg[1].toString(), msg[2]);
			else console.error(`Invalid message type ${msgType}`);
		}
		createDecodeSource(reader) {
			let readable = reader;
			if (typeof readable.iterator === "function") return readable.iterator({ destroyOnReturn: false });
			return reader;
		}
		async decodeLoop(iter, generation) {
			try {
				while (true) {
					const resolved = await iter.next();
					if (resolved.done || !this.attached || iter !== this.decodeIterator || generation !== this.decodeGeneration) return;
					if (Array.isArray(resolved.value)) this.parseMessage(resolved.value);
					else console.error("invalid msgpack-RPC message: expected array");
				}
			} catch (err) {
				if (iter !== this.decodeIterator || generation !== this.decodeGeneration) return;
				console.error("Decode stream error:", err);
				this.detach();
			}
		}
		attach(writer, reader, client) {
			this.writer = writer;
			this.reader = reader;
			this.client = client;
			this.attached = true;
			this.decodeGeneration = this.decodeGeneration + 1;
			const generation = this.decodeGeneration;
			this.onReaderEnd = () => {
				this.detach();
			};
			this.reader.once("end", this.onReaderEnd);
			const asyncDecodeGenerator = (0, msgpack_1.decodeMultiStream)(this.createDecodeSource(this.reader), { extensionCodec: this.extensionCodec });
			this.decodeIterator = asyncDecodeGenerator;
			this.decodeLoop(asyncDecodeGenerator, generation);
		}
		detach() {
			if (!this.attached) return;
			this.attached = false;
			this.decodeGeneration = this.decodeGeneration + 1;
			if (this.onReaderEnd) {
				this.reader.off("end", this.onReaderEnd);
				this.onReaderEnd = void 0;
			}
			let iter = this.decodeIterator;
			this.decodeIterator = void 0;
			if (iter && typeof iter.return === "function") iter.return(void 0).catch((err) => {
				this.debug("decode iterator return error:", err);
			});
			for (let handler of this.pending.values()) handler([0, error_1.disconnectedText]);
			this.pending.clear();
			this.emit("detach");
		}
		request(method, args, cb) {
			if (!this.attached) return cb([0, error_1.disconnectedText]);
			let id = this.nextRequestId;
			this.nextRequestId = this.nextRequestId + 1;
			let startTs = Date.now();
			this.debug("request to nvim:", id, method, args);
			this.writer.write(this.encodeToBuffer([
				0,
				id,
				method,
				args
			]));
			let timer;
			if (REQUEST_TIMEOUT > 0) timer = setTimeout(() => {
				let handler = this.pending.get(id);
				if (!handler) return;
				this.pending.delete(id);
				handler([0, `Request "${method}" timed out after ${REQUEST_TIMEOUT}ms.`]);
			}, REQUEST_TIMEOUT);
			this.pending.set(id, (err, res) => {
				if (timer) clearTimeout(timer);
				this.debug("response of nvim:", id, Date.now() - startTs, res, err);
				cb(err, res);
			});
		}
		notify(method, args) {
			if (!this.attached) return;
			if (this.pauseLevel != 0) {
				let arr = this.paused.get(this.pauseLevel);
				if (arr) {
					arr.push([method, args]);
					return;
				}
			}
			this.debug("nvim notification:", method, args);
			this.writer.write(this.encodeToBuffer([
				2,
				method,
				args
			]));
		}
		send(arr) {
			this.writer.write(this.encodeToBuffer(arr));
		}
		vimCommand(command, ..._args) {
			throw new Error(`Command "${command}"  not exists on nvim`);
		}
		vimRequest(command, _args) {
			throw new Error(`Command "${command}"  not exists on nvim`);
		}
		createResponse(_method, requestId) {
			let startTs = Date.now();
			let called = false;
			return { send: (resp, isError) => {
				if (called || !this.attached) return;
				this.debug("response of client:", requestId, `${Date.now() - startTs}ms`, resp, isError == true);
				called = true;
				this.writer.write(this.encodeToBuffer([
					1,
					requestId,
					isError ? resp : null,
					!isError ? resp : null
				]));
			} };
		}
	};
	exports.NvimTransport = NvimTransport;
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/transport/connection.js
var require_connection = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	var events_1$7 = __importDefault(require("events"));
	var logger = (0, require_logger$1().createLogger)("connection");
	var NR_CODE = 10;
	var Connection = class extends events_1$7.default {
		constructor(readable, writable) {
			super();
			this.writable = writable;
			let cached = [];
			let hasCache = false;
			readable.once("data", (buf) => {
				if (!Buffer.isBuffer(buf)) throw new Error(`Vim connection expect Buffer from readable stream.`);
			});
			let onData = (buf) => {
				let start = 0;
				let len = buf.byteLength;
				for (let i = 0; i < len; i++) if (buf[i] === NR_CODE) {
					let b = buf.slice(start, i);
					if (hasCache) {
						cached.push(b);
						let concated = Buffer.concat(cached);
						hasCache = false;
						cached = [];
						this.parseData(concated.toString("utf8"));
					} else this.parseData(b.toString("utf8"));
					start = i + 1;
				}
				if (start < len) {
					cached.push(start == 0 ? buf : buf.slice(start));
					hasCache = true;
				}
			};
			readable.on("data", onData);
			let onClose = () => {
				logger.warn("readable stream closed.");
			};
			readable.on("close", onClose);
			this.clean = () => {
				readable.off("data", onData);
				readable.off("close", onClose);
			};
		}
		parseData(str) {
			if (str.length == 0) return;
			let arr;
			try {
				arr = JSON.parse(str);
			} catch (e) {
				logger.error(`Invalid data from vim: ${str}`);
				return;
			}
			let [id, obj] = arr;
			if (id > 0) {
				logger.debug("received request:", id, obj);
				this.emit("request", id, obj);
			} else if (id == 0) {
				logger.debug("received notification:", obj);
				this.emit("notification", obj);
			} else {
				logger.debug("received response:", id, obj);
				this.emit("response", id, obj);
			}
		}
		response(requestId, data) {
			this.send([requestId, data || null]);
		}
		notify(event, data) {
			this.send([0, [event, data || null]]);
		}
		send(arr) {
			logger.debug("send to vim:", arr);
			this.writable.write(JSON.stringify(arr) + "\n");
		}
		redraw(force) {
			this.send(["redraw", force ? "force" : ""]);
		}
		ex(cmd) {
			this.send(["ex", cmd]);
		}
		expr(expr, requestId) {
			if (typeof requestId === "number") {
				this.send([
					"expr",
					expr,
					requestId
				]);
				return;
			}
			this.send(["expr", expr]);
		}
		call(func, args, requestId) {
			if (typeof requestId === "number") {
				this.send([
					"call",
					func,
					args,
					requestId
				]);
				return;
			}
			this.send([
				"call",
				func,
				args
			]);
		}
		dispose() {
			if (typeof this.clean === "function") {
				this.clean();
				this.clean = void 0;
			}
			this.removeAllListeners();
		}
	};
	exports.default = Connection;
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/transport/request.js
var require_request = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var func = require_constants$1().isCocNvim ? "coc#api#Call" : "nvim#api#Call";
	var Request = class {
		constructor(connection, cb, id) {
			this.connection = connection;
			this.cb = cb;
			this.id = id;
			this.method = "";
			this._direct = false;
		}
		get isDirect() {
			return this._direct;
		}
		request(method, args = []) {
			this.method = method;
			this.connection.call(func, [method.startsWith("nvim_") ? method.slice(5) : method, args], this.id);
		}
		call(method, args = []) {
			this._direct = true;
			this.method = "call";
			this.connection.call(method, args, this.id);
		}
		expr(expr) {
			this._direct = true;
			this.method = "expr";
			this.connection.expr(expr, this.id);
		}
		callback(client, err, result) {
			let { method, cb } = this;
			if (err) return cb([0, err.toString()]);
			switch (method) {
				case "nvim_list_wins":
				case "nvim_tabpage_list_wins": return cb(null, Array.isArray(result) ? result.map((o) => client.createWindow(o)) : []);
				case "nvim_tabpage_get_win":
				case "nvim_get_current_win":
				case "nvim_open_win": return cb(null, client.createWindow(result));
				case "nvim_list_bufs": return cb(null, Array.isArray(result) ? result.map((o) => client.createBuffer(o)) : []);
				case "nvim_win_get_buf":
				case "nvim_create_buf":
				case "nvim_get_current_buf": return cb(null, client.createBuffer(result));
				case "nvim_list_tabpages": return cb(null, Array.isArray(result) ? result.map((o) => client.createTabpage(o)) : []);
				case "nvim_win_get_tabpage":
				case "nvim_get_current_tabpage": return cb(null, client.createTabpage(result));
				default: return cb(null, result);
			}
		}
	};
	exports.default = Request;
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/transport/vim.js
var require_vim = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VimTransport = void 0;
	var error_1 = require_error();
	var constants_1 = require_constants$1();
	var base_1 = __importDefault(require_base());
	var connection_1 = __importDefault(require_connection());
	var request_1 = __importDefault(require_request());
	var notifyMethod = constants_1.isCocNvim ? "coc#api#Notify" : "nvim#api#Notify";
	var VimTransport = class extends base_1.default {
		constructor(logger) {
			super(logger, true);
			this.pending = /* @__PURE__ */ new Map();
			this.nextRequestId = -1;
			this.attached = false;
			/**
			* Cached error message
			*/
			this.errText = "";
			/**
			* Cached out message
			*/
			this.outText = "";
		}
		attach(writer, reader, client) {
			let connection = this.connection = new connection_1.default(reader, writer);
			this.attached = true;
			this.client = client;
			connection.on("request", (id, obj) => {
				let [method, args] = obj;
				this.emit("request", method, args, this.createResponse(method, id));
			});
			connection.on("notification", (obj) => {
				let [event, args] = obj;
				this.emit("notification", event.toString(), args);
			});
			connection.on("response", (id, obj) => {
				let req = this.pending.get(id);
				if (req) {
					this.pending.delete(id);
					let err = null;
					let result = null;
					if (req.isDirect) result = obj;
					else if (!Array.isArray(obj)) err = obj;
					else {
						err = obj[0];
						result = obj[1];
					}
					req.callback(this.client, err, result);
				}
			});
		}
		send(arr) {
			this.connection.send(arr);
		}
		detach() {
			if (!this.attached) return;
			this.attached = false;
			this.connection.dispose();
			for (let req of this.pending.values()) req.callback(this.client, "connection disconnected", null);
			this.pending.clear();
		}
		vimCommand(command, ...args) {
			switch (command) {
				case "expr":
					this.connection.expr(args[0]);
					break;
				case "call":
					this.connection.call(args[0], args[1]);
					break;
				case "ex":
					this.connection.ex(args[0]);
					break;
				case "redraw":
					this.connection.redraw(args[0]);
					break;
				default: throw new Error(`command "${command}" not exists`);
			}
		}
		vimRequest(command, args) {
			if (!this.attached) return Promise.reject(/* @__PURE__ */ new Error("transport disconnected"));
			if (!global.__TEST__) Error.captureStackTrace(args);
			let id = this.nextRequestId;
			this.nextRequestId = this.nextRequestId - 1;
			return new Promise((resolve, reject) => {
				let req = new request_1.default(this.connection, (err, res) => {
					if (!err && res === "ERROR") {
						if (command === "eval") err = /* @__PURE__ */ new Error(`Invalid expression "${args[0]}", checkout v:errmsg`);
						else err = /* @__PURE__ */ new Error(`Error on function "${args[0]}", checkout v:errmsg"`);
					}
					if (err) {
						err.stack = `Error: vim "${command}" error - ${err}\n` + (args["stack"] ? args["stack"].split(/\r?\n/).slice(3).join("\n") : "");
						this.client.logError(`Error on vim command "${command}"`, args, err);
						reject(err instanceof Error ? err : new Error(String(err)));
						return;
					}
					resolve(res);
				}, id);
				this.pending.set(id, req);
				if (command === "call") req.call(args[0], args[1]);
				else req.expr(args[0]);
			});
		}
		/**
		* Send request to vim
		*/
		request(method, args, cb) {
			if (!this.attached) return cb([0, error_1.disconnectedText]);
			let id = this.nextRequestId;
			this.nextRequestId = this.nextRequestId - 1;
			let req = new request_1.default(this.connection, (err, res) => {
				cb(err, res);
			}, id);
			this.pending.set(id, req);
			req.request(method, args);
		}
		notify(method, args) {
			if (!this.attached) return;
			if (this.pauseLevel != 0) {
				let arr = this.paused.get(this.pauseLevel);
				if (arr) {
					arr.push([method, args]);
					return;
				}
			}
			let fname = method.slice(5);
			if (fname == "err_write") {
				this.errText = this.errText + args[0].toString();
				return;
			}
			if (fname == "out_write") {
				let msg = args[0].toString() || "";
				if (!msg.includes("\n")) this.outText = this.outText + msg;
				else {
					let text = this.outText + args[0].toString();
					this.outText = "";
					this.connection.call(notifyMethod, [fname, [text]]);
				}
				return;
			}
			if (fname == "err_writeln") {
				let text = this.errText + args[0].toString();
				this.errText = "";
				this.connection.call(notifyMethod, [fname, [text]]);
				return;
			}
			this.connection.call(notifyMethod, [fname, args]);
		}
		createResponse(_method, requestId) {
			let called = false;
			let { connection } = this;
			return { send: (resp, isError) => {
				if (called || !this.attached) return;
				called = true;
				let err = null;
				if (isError) err = typeof resp === "string" ? resp : resp.toString();
				connection.response(requestId, [err, isError ? null : resp]);
			} };
		}
	};
	exports.VimTransport = VimTransport;
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/api/Neovim.js
var require_Neovim = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Neovim = void 0;
	var constants_1 = require_constants$1();
	var Base_1 = require_Base();
	function getArgs(args) {
		if (!args) return [];
		if (Array.isArray(args)) return args;
		return [args];
	}
	/**
	* Neovim API
	*/
	var Neovim = class extends Base_1.BaseApi {
		constructor() {
			super(...arguments);
			this.prefix = "nvim_";
		}
		get apiInfo() {
			return this.request(`${this.prefix}get_api_info`);
		}
		/** Get list of all buffers */
		get buffers() {
			return this.request(`${this.prefix}list_bufs`);
		}
		/** Get current buffer */
		get buffer() {
			return this.request(`${this.prefix}get_current_buf`);
		}
		/** Retrieves a scoped option depending on type of `this` */
		getOption(name) {
			if (constants_1.isCocNvim) return this.request(`${this.prefix}get_option_value`, [name, {}]);
			return super.getOption(name);
		}
		setOption(name, value, isNotify) {
			if (constants_1.isCocNvim) return this[isNotify ? "notify" : "request"](`${this.prefix}set_option_value`, [
				name,
				value,
				{}
			]);
			return this[isNotify ? "notify" : "request"](`${this.prefix}set_option`, [name, value]);
		}
		/** Set current buffer */
		async setBuffer(buffer) {
			await this.request(`${this.prefix}set_current_buf`, [buffer]);
		}
		get chans() {
			return this.request(`${this.prefix}list_chans`);
		}
		getChanInfo(chan) {
			return this.request(`${this.prefix}get_chan_info`, [chan]);
		}
		createNamespace(name = "") {
			if (constants_1.isCocNvim) name = name.startsWith("coc-") ? name : `coc-${name}`;
			return this.request(`${this.prefix}create_namespace`, [name]);
		}
		get namespaces() {
			return this.request(`${this.prefix}get_namespaces`, []);
		}
		get commands() {
			return this.getCommands();
		}
		getCommands(options = {}) {
			return this.request(`${this.prefix}get_commands`, [options]);
		}
		/** Get list of all tabpages */
		get tabpages() {
			return this.request(`${this.prefix}list_tabpages`);
		}
		/** Get current tabpage */
		get tabpage() {
			return this.request(`${this.prefix}get_current_tabpage`);
		}
		/** Set current tabpage */
		async setTabpage(tabpage) {
			await this.request(`${this.prefix}set_current_tabpage`, [tabpage]);
		}
		/** Get list of all windows */
		get windows() {
			return this.getWindows();
		}
		/** Get current window */
		get window() {
			return this.request(`${this.prefix}get_current_win`);
		}
		/** Get list of all windows */
		getWindows() {
			return this.request(`${this.prefix}list_wins`);
		}
		async setWindow(win) {
			await this.request(`${this.prefix}set_current_win`, [win]);
		}
		/** Get list of all runtime paths */
		get runtimePaths() {
			return this.request(`${this.prefix}list_runtime_paths`);
		}
		/** Set current directory */
		setDirectory(dir) {
			return this.request(`${this.prefix}set_current_dir`, [dir]);
		}
		/** Get current line. Always returns a Promise. */
		get line() {
			return this.getLine();
		}
		createNewBuffer(listed = false, scratch = false) {
			return this.request(`${this.prefix}create_buf`, [listed, scratch]);
		}
		openFloatWindow(buffer, enter, options) {
			return this.request(`${this.prefix}open_win`, [
				buffer,
				enter,
				options
			]);
		}
		getLine() {
			return this.request(`${this.prefix}get_current_line`);
		}
		/** Set current line */
		setLine(line) {
			return this.request(`${this.prefix}set_current_line`, [line]);
		}
		/** Gets keymap */
		getKeymap(mode) {
			return this.request(`${this.prefix}get_keymap`, [mode]);
		}
		/**
		* Add keymap by notification, replace keycodes for expr keymap enabled by default.
		*/
		setKeymap(mode, lhs, rhs, opts = {}) {
			let option = opts.expr ? Object.assign({ replace_keycodes: true }, opts) : opts;
			this.notify(`${this.prefix}set_keymap`, [
				mode,
				lhs,
				rhs,
				option
			]);
		}
		deleteKeymap(mode, lhs) {
			this.notify(`${this.prefix}del_keymap`, [mode, lhs]);
		}
		/** Gets current mode */
		get mode() {
			return this.request(`${this.prefix}get_mode`);
		}
		/** Gets map of defined colors */
		get colorMap() {
			return this.request(`${this.prefix}get_color_map`);
		}
		/** Get color by name */
		getColorByName(name) {
			return this.request(`${this.prefix}get_color_by_name`, [name]);
		}
		/** Get highlight by name or id */
		getHighlight(nameOrId, isRgb = true) {
			const functionName = typeof nameOrId === "string" ? "by_name" : "by_id";
			return this.request(`${this.prefix}get_hl_${functionName}`, [nameOrId, isRgb]);
		}
		getHighlightByName(name, isRgb = true) {
			return this.request(`${this.prefix}get_hl_by_name`, [name, isRgb]);
		}
		getHighlightById(id, isRgb = true) {
			return this.request(`${this.prefix}get_hl_by_id`, [id, isRgb]);
		}
		/** Delete current line in buffer */
		deleteCurrentLine() {
			return this.request(`${this.prefix}del_current_line`);
		}
		/**
		* Evaluates a VimL expression (:help expression). Dictionaries
		* and Lists are recursively expanded. On VimL error: Returns a
		* generic error; v:errmsg is not updated.
		*
		*/
		eval(expr) {
			return this.request(`${this.prefix}eval`, [expr]);
		}
		/**
		* Executes lua, it's possible neovim client does not support this
		*/
		lua(code, args = []) {
			return this.request(`${this.prefix}exec_lua`, [code, args]);
		}
		executeLua(code, args = []) {
			const _args = getArgs(args);
			return this.lua(code, _args);
		}
		callDictFunction(dict, fname, args = []) {
			const _args = getArgs(args);
			return this.request(`${this.prefix}call_dict_function`, [
				dict,
				fname,
				_args
			]);
		}
		callVim(fname, args = [], isNotify) {
			if (!constants_1.isVim) return this.call(fname, args, isNotify);
			const _args = getArgs(args);
			if (isNotify) return this.transport.vimCommand("call", fname, _args);
			return this.transport.vimRequest("call", [fname, _args]);
		}
		/**
		* Use direct expr command on vim9
		*/
		evalVim(expr) {
			if (!constants_1.isVim) return this.request(`${this.prefix}eval`, [expr]);
			return this.transport.vimRequest("eval", [expr]);
		}
		/**
		* Use direct ex on vim9
		*/
		exVim(arg) {
			if (!constants_1.isVim) return this.notify(`${this.prefix}command`, [arg]);
			this.transport.vimCommand("ex", arg);
		}
		call(fname, args = [], isNotify) {
			const _args = getArgs(args);
			if (isNotify) {
				this.notify(`${this.prefix}call_function`, [fname, _args]);
				return null;
			}
			return this.request(`${this.prefix}call_function`, [fname, _args]);
		}
		callTimer(fname, args = [], isNotify) {
			const _args = getArgs(args);
			if (isNotify) {
				this.notify(`${this.prefix}call_function`, ["coc#util#timer", [fname, _args]]);
				return null;
			}
			if (constants_1.isVim) {
				this.notify(`${this.prefix}call_function`, ["coc#util#timer", [fname, _args]]);
				return new Promise((resolve) => {
					setTimeout(() => {
						resolve(null);
					}, 20);
				});
			}
			return this.request(`${this.prefix}call_function`, ["coc#util#timer", [fname, _args]]);
		}
		callAsync(fname, args = []) {
			const _args = getArgs(args);
			return this.client.sendAsyncRequest(fname, _args);
		}
		/** Alias for `call` */
		callFunction(fname, args = []) {
			return this.call(fname, args);
		}
		/** Call Atomic calls */
		callAtomic(calls) {
			return this.request(`${this.prefix}call_atomic`, [calls]);
		}
		command(arg, isNotify) {
			if (isNotify) {
				this.notify(`${this.prefix}command`, [arg]);
				return null;
			}
			return this.request(`${this.prefix}command`, [arg]);
		}
		/**
		* Runs a command and returns output.
		* @deprecated Use exec instead.
		*/
		commandOutput(arg) {
			return this.request(`${this.prefix}command_output`, [arg]);
		}
		/**
		* Executes Vimscript (multiline block of Ex-commands), like
		* anonymous |:source|
		*/
		exec(src, output = false) {
			return this.request(`${this.prefix}exec`, [src, output]);
		}
		/** Gets a v: variable */
		getVvar(name) {
			return this.request(`${this.prefix}get_vvar`, [name]);
		}
		/** feedKeys */
		feedKeys(keys, mode, escapeCsi) {
			return this.request(`${this.prefix}feedkeys`, [
				keys,
				mode,
				escapeCsi
			]);
		}
		/** Sends input keys */
		input(keys) {
			return this.request(`${this.prefix}input`, [keys]);
		}
		/**
		* Send mouse event from GUI. Neovim only.
		* @param {MouseButton} button Mouse button: one of "left", "right", "middle", "wheel", "move".
		* @param {ButtonAction} action For ordinary buttons, one of "press", "drag", "release".
		* @param {string} modifier String of modifiers each represented by a single char.
		* @param {number} row Mouse row-position (zero-based, like redraw events)
		* @param {number} col Mouse column-position (zero-based, like redraw events)
		* @param {number} grid Grid number if the client uses |ui-multigrid|, else 0.
		* @returns {Promise<null>}
		*/
		inputMouse(button, action, modifier, row, col, grid = 0) {
			return this.request(`${this.prefix}input_mouse`, [
				button,
				action,
				modifier,
				grid,
				row,
				col
			]);
		}
		/**
		* Parse a VimL Expression
		*
		* TODO: return type, see :help
		*/
		parseExpression(expr, flags, highlight) {
			return this.request(`${this.prefix}parse_expression`, [
				expr,
				flags,
				highlight
			]);
		}
		getProc(pid) {
			return this.request(`${this.prefix}get_proc`, [pid]);
		}
		getProcChildren(pid) {
			return this.request(`${this.prefix}get_proc_children`, [pid]);
		}
		/** Replace term codes */
		replaceTermcodes(str, fromPart, doIt, special) {
			return this.request(`${this.prefix}replace_termcodes`, [
				str,
				fromPart,
				doIt,
				special
			]);
		}
		/** Gets width of string */
		strWidth(str) {
			return this.request(`${this.prefix}strwidth`, [str]);
		}
		/** Write to output buffer */
		outWrite(str) {
			this.notify(`${this.prefix}out_write`, [str]);
		}
		outWriteLine(str) {
			this.outWrite(`${str}\n`);
		}
		/** Write to error buffer */
		errWrite(str) {
			this.notify(`${this.prefix}err_write`, [str]);
		}
		/** Write to error buffer */
		errWriteLine(str) {
			this.notify(`${this.prefix}err_writeln`, [str]);
		}
		get uis() {
			return this.request(`${this.prefix}list_uis`);
		}
		uiAttach(width, height, options) {
			return this.request(`${this.prefix}ui_attach`, [
				width,
				height,
				options
			]);
		}
		uiDetach() {
			return this.request(`${this.prefix}ui_detach`, []);
		}
		uiTryResize(width, height) {
			return this.request(`${this.prefix}ui_try_resize`, [width, height]);
		}
		/** Set UI Option */
		uiSetOption(name, value) {
			return this.request(`${this.prefix}ui_set_option`, [name, value]);
		}
		/** Subscribe to nvim event broadcasts */
		subscribe(event) {
			return this.request(`${this.prefix}subscribe`, [event]);
		}
		/** Unsubscribe to nvim event broadcasts */
		unsubscribe(event) {
			return this.request(`${this.prefix}unsubscribe`, [event]);
		}
		createAugroup(name, option = {}, isNotify = false) {
			if (!isNotify) return this.request(`${this.prefix}create_augroup`, [name, option]);
			this.notify(`${this.prefix}create_augroup`, [name, option]);
		}
		createAutocmd(event, option = {}, isNotify = false) {
			if (!isNotify) return this.request(`${this.prefix}create_autocmd`, [event, option]);
			this.notify(`${this.prefix}create_autocmd`, [event, option]);
		}
		deleteAutocmd(id) {
			this.notify(`${this.prefix}del_autocmd`, [id]);
		}
		setClientInfo(name, version, type, methods, attributes) {
			this.notify(`${this.prefix}set_client_info`, [
				name,
				version,
				type,
				methods,
				attributes
			]);
		}
		/** Quit nvim */
		async quit() {
			this.command("qa!", true);
			if (this.transport) this.transport.detach();
		}
	};
	exports.Neovim = Neovim;
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/api/client.js
var require_client$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NeovimClient = exports.AsyncResponse = void 0;
	/**
	* Handles attaching transport
	*/
	var events_1$6 = require("events");
	var nvim_1 = require_nvim$1();
	var vim_1 = require_vim();
	var constants_1 = require_constants$1();
	var error_1 = require_error();
	var Buffer_1 = require_Buffer();
	var Neovim_1 = require_Neovim();
	var Tabpage_1 = require_Tabpage();
	var Window_1 = require_Window();
	var functionsOnVim = [
		"nvim_buf_attach",
		"nvim_get_mode",
		"nvim_list_runtime_paths",
		"nvim_win_del_var",
		"nvim_create_buf",
		"nvim_exec",
		"nvim_tabpage_list_wins",
		"nvim_buf_del_var",
		"nvim_buf_get_mark",
		"nvim_tabpage_set_var",
		"nvim_create_namespace",
		"nvim_win_get_position",
		"nvim_win_set_height",
		"nvim_call_atomic",
		"nvim_buf_detach",
		"nvim_buf_line_count",
		"nvim_set_current_buf",
		"nvim_set_current_dir",
		"nvim_get_var",
		"nvim_del_current_line",
		"nvim_win_set_width",
		"nvim_out_write",
		"nvim_win_is_valid",
		"nvim_set_current_win",
		"nvim_get_current_tabpage",
		"nvim_tabpage_is_valid",
		"nvim_set_var",
		"nvim_win_get_height",
		"nvim_win_get_buf",
		"nvim_win_get_width",
		"nvim_buf_set_name",
		"nvim_subscribe",
		"nvim_get_current_win",
		"nvim_feedkeys",
		"nvim_get_vvar",
		"nvim_tabpage_get_number",
		"nvim_get_current_buf",
		"nvim_win_get_option",
		"nvim_win_get_cursor",
		"nvim_get_current_line",
		"nvim_win_get_var",
		"nvim_buf_get_var",
		"nvim_set_current_tabpage",
		"nvim_buf_clear_namespace",
		"nvim_err_write",
		"nvim_del_var",
		"nvim_call_dict_function",
		"nvim_set_current_line",
		"nvim_get_api_info",
		"nvim_unsubscribe",
		"nvim_get_option",
		"nvim_list_wins",
		"nvim_set_client_info",
		"nvim_win_set_cursor",
		"nvim_win_set_option",
		"nvim_eval",
		"nvim_tabpage_get_var",
		"nvim_buf_get_option",
		"nvim_tabpage_del_var",
		"nvim_buf_get_name",
		"nvim_list_bufs",
		"nvim_win_set_buf",
		"nvim_win_close",
		"nvim_command_output",
		"nvim_command",
		"nvim_tabpage_get_win",
		"nvim_win_set_var",
		"nvim_buf_add_highlight",
		"nvim_buf_set_var",
		"nvim_win_get_number",
		"nvim_strwidth",
		"nvim_buf_set_lines",
		"nvim_err_writeln",
		"nvim_buf_set_option",
		"nvim_list_tabpages",
		"nvim_set_option",
		"nvim_buf_get_lines",
		"nvim_buf_get_changedtick",
		"nvim_win_get_tabpage",
		"nvim_call_function",
		"nvim_buf_is_valid"
	];
	var AsyncResponse = class {
		constructor(requestId, cb) {
			this.requestId = requestId;
			this.cb = cb;
			this.finished = false;
		}
		finish(err, res) {
			if (this.finished) return;
			this.finished = true;
			if (err) {
				this.cb(new Error(err));
				return;
			}
			this.cb(null, res);
		}
	};
	exports.AsyncResponse = AsyncResponse;
	function applyMixins(derivedCtor, constructors) {
		constructors.forEach((baseCtor) => {
			Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
				Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null));
			});
		});
	}
	var NeovimClient = class extends Neovim_1.Neovim {
		constructor(logger, isVim) {
			super({});
			this.logger = logger;
			this.isVim = isVim;
			this.requestId = 1;
			this.responses = /* @__PURE__ */ new Map();
			this.attachedBuffers = /* @__PURE__ */ new Map();
			const transport = isVim ? new vim_1.VimTransport(logger) : new nvim_1.NvimTransport(logger);
			Object.defineProperty(this, "_transport", {
				enumerable: false,
				get: () => {
					return transport;
				}
			});
			this.handleRequest = this.handleRequest.bind(this);
			this.handleNotification = this.handleNotification.bind(this);
		}
		get transport() {
			return this._transport;
		}
		echoError(msg) {
			let prefix = constants_1.isCocNvim ? "[coc.nvim] " : "";
			if (msg instanceof Error) {
				if (!constants_1.isTester) this.errWriteLine(prefix + msg.message + " use :CocOpenLog for details");
				this.logError(msg.message || "Unknown error", msg);
			} else {
				if (!constants_1.isTester) this.errWriteLine(prefix + msg);
				this.logError(msg.toString(), /* @__PURE__ */ new Error());
			}
		}
		logError(msg, ...args) {
			if (constants_1.isTester) console.error(msg, ...args);
			if (!this.logger) return;
			this.logger.error(msg, ...args);
		}
		createBuffer(id) {
			return new Buffer_1.Buffer({
				data: id,
				client: this
			});
		}
		createWindow(id) {
			return new Window_1.Window({
				data: id,
				client: this
			});
		}
		createTabpage(id) {
			return new Tabpage_1.Tabpage({
				data: id,
				client: this
			});
		}
		/**
		* Invoke redraw on vim, must called when screen need update.
		*/
		redrawVim(force) {
			if (!this.isVim) return;
			this.transport.notify("nvim_command", [`redraw${force ? "!" : ""}`]);
		}
		/** Attaches msgpack to read/write streams * */
		attach({ reader, writer }, requestApi = true) {
			this.transport.attach(writer, reader, this);
			this.transport.on("request", this.handleRequest);
			this.transport.on("notification", this.handleNotification);
			this.transport.on("detach", () => {
				this.emit("disconnect");
				this.rejectPendingResponses();
				this.transport.removeAllListeners("request");
				this.transport.removeAllListeners("notification");
				this.transport.removeAllListeners("detach");
			});
			if (requestApi) this._isReady = this.generateApi().catch((err) => {
				this.logger.error(err);
				return false;
			});
			else {
				this._channelId = -1;
				this._isReady = Promise.resolve(true);
			}
		}
		detach() {
			this.attachedBuffers.clear();
			this.rejectPendingResponses();
			this.transport.detach();
			this.removeAllListeners();
		}
		/**
		* Reject pending async responses. They will never be answered once the
		* transport is gone, and leaving them pending would keep callers like
		* `funcs.callAsync` blocked on the shared mutex forever.
		*/
		rejectPendingResponses() {
			if (this.responses.size === 0) return;
			const err = new Error(error_1.disconnectedText);
			for (const response of this.responses.values()) response.finish(err.message);
			this.responses.clear();
		}
		get channelId() {
			return this._isReady.then(() => {
				return this._channelId;
			});
		}
		handleRequest(method, args, resp) {
			this.emit("request", method, args, resp);
		}
		sendAsyncRequest(method, args) {
			let id = this.requestId;
			this.requestId = id + 1;
			this.notify("nvim_call_function", ["coc#rpc#async_request", [
				id,
				method,
				args || []
			]]);
			return new Promise((resolve, reject) => {
				let response = new AsyncResponse(id, (err, res) => {
					if (err) return reject(err);
					resolve(res);
				});
				this.responses.set(id, response);
			});
		}
		handleNotification(method, args) {
			if (method.endsWith("_event")) {
				if (method === "vim_buf_change_event") {
					const id = args[0];
					if (!this.attachedBuffers.has(id)) return;
					(this.attachedBuffers.get(id).get("vim_lines") || []).forEach((cb) => cb(...args));
					return;
				}
				if (method.startsWith("nvim_buf_")) {
					const shortName = method.replace(/nvim_buf_(.*)_event/, "$1");
					const { id } = args[0];
					if (!this.attachedBuffers.has(id)) return;
					(this.attachedBuffers.get(id).get(shortName) || []).forEach((cb) => cb(...args));
					if (shortName === "detach") this.attachedBuffers.delete(id);
					return;
				}
				if (method === "nvim_async_request_event") {
					const [id, method, arr] = args;
					this.handleRequest(method, arr, { send: (resp, isError) => {
						this.notify("nvim_call_function", ["coc#rpc#async_response", [
							id,
							resp,
							isError
						]]);
					} });
					return;
				}
				if (method === "nvim_async_response_event") {
					const [id, err, res] = args;
					const response = this.responses.get(id);
					if (!response) {
						this.logError(`Response not found for request ${id}`);
						return;
					}
					this.responses.delete(id);
					response.finish(err, res);
					return;
				}
				if (method === "nvim_error_event") {
					this.logger.error(`Error event from nvim:`, args[0], args[1]);
					this.emit("vim_error", args[1]);
					return;
				}
				this.logger.warn(`Unhandled event: ${method}`, args);
			} else this.emit("notification", method, args);
		}
		requestApi() {
			return new Promise((resolve, reject) => {
				this.transport.request("nvim_get_api_info", [], (err, res) => {
					if (err) reject(new Error(Array.isArray(err) ? err[1] : err.message || err.toString()));
					else resolve(res);
				});
			});
		}
		async generateApi() {
			const [channelId, metadata] = await this.requestApi();
			this._channelId = channelId;
			return true;
		}
		attachBufferEvent(bufnr, eventName, cb) {
			const bufferMap = this.attachedBuffers.get(bufnr) || /* @__PURE__ */ new Map();
			const cbs = bufferMap.get(eventName) || [];
			if (cbs.includes(cb)) return;
			cbs.push(cb);
			bufferMap.set(eventName, cbs);
			this.attachedBuffers.set(bufnr, bufferMap);
		}
		/**
		* Returns `true` if buffer should be detached
		*/
		detachBufferEvent(bufnr, eventName, cb) {
			const bufferMap = this.attachedBuffers.get(bufnr);
			if (!bufferMap || !bufferMap.has(eventName)) return;
			const handlers = bufferMap.get(eventName).filter((handler) => handler !== cb);
			bufferMap.set(eventName, handlers);
		}
		pauseNotification() {
			let o = {};
			if (!global.__TEST__) Error.captureStackTrace(o);
			if (this.transport.pauseLevel !== 0) this.logError(`Nested nvim.pauseNotification() detected, please avoid it:`, o.stack);
			this.transport.pauseNotification();
			process.nextTick(() => {
				if (this.transport.pauseLevel > 0) this.logError(`resumeNotification not called within same tick:`, o.stack);
			});
		}
		resumeNotification(redrawVim, notify) {
			if (this.isVim && redrawVim) this.transport.notify("nvim_command", ["redraw"]);
			if (notify) {
				this.transport.resumeNotification(true);
				return;
			}
			return this.transport.resumeNotification();
		}
		/**
		* @deprecated
		*/
		hasFunction(name) {
			if (!this.isVim) return true;
			return functionsOnVim.includes(name);
		}
	};
	exports.NeovimClient = NeovimClient;
	applyMixins(NeovimClient, [events_1$6.EventEmitter]);
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/api/index.js
var require_api = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Tabpage = exports.Window = exports.Buffer = exports.NeovimClient = exports.Neovim = void 0;
	var client_1 = require_client$1();
	Object.defineProperty(exports, "Neovim", {
		enumerable: true,
		get: function() {
			return client_1.NeovimClient;
		}
	});
	var client_2 = require_client$1();
	Object.defineProperty(exports, "NeovimClient", {
		enumerable: true,
		get: function() {
			return client_2.NeovimClient;
		}
	});
	var Buffer_1 = require_Buffer();
	Object.defineProperty(exports, "Buffer", {
		enumerable: true,
		get: function() {
			return Buffer_1.Buffer;
		}
	});
	var Window_1 = require_Window();
	Object.defineProperty(exports, "Window", {
		enumerable: true,
		get: function() {
			return Window_1.Window;
		}
	});
	var Tabpage_1 = require_Tabpage();
	Object.defineProperty(exports, "Tabpage", {
		enumerable: true,
		get: function() {
			return Tabpage_1.Tabpage;
		}
	});
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/attach/attach.js
var require_attach = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.attach = attach;
	var net_1 = require("net");
	var constants_1 = require_constants$1();
	var logger_1 = require_logger$1();
	var client_1 = require_client$1();
	function attach({ reader: _reader, writer: _writer, proc, socket }, logger = null, requestApi = true) {
		let writer;
		let reader;
		let neovim;
		if (!logger) logger = logger_1.nullLogger;
		if (socket) {
			const client = (0, net_1.createConnection)(socket);
			writer = client;
			reader = client;
			client.once("close", () => {
				neovim.detach();
			});
		} else if (_reader && _writer) {
			writer = _writer;
			reader = _reader;
		} else if (proc) {
			writer = proc.stdin;
			reader = proc.stdout;
			proc.once("disconnect", () => {
				neovim.detach();
			});
		}
		if (writer && reader) {
			neovim = new client_1.NeovimClient(logger, constants_1.isVim);
			neovim.attach({
				writer,
				reader
			}, requestApi);
			writer.on("error", (err) => {
				if (err.code === "EPIPE") neovim.detach();
			});
			return neovim;
		}
		throw new Error("Invalid arguments, could not attach");
	}
}));
//#endregion
//#region ../node_modules/@chemzqm/neovim/lib/index.js
var require_lib$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.attach = exports.Window = exports.Tabpage = exports.Neovim = exports.Buffer = void 0;
	var index_1 = require_api();
	Object.defineProperty(exports, "Buffer", {
		enumerable: true,
		get: function() {
			return index_1.Buffer;
		}
	});
	Object.defineProperty(exports, "Neovim", {
		enumerable: true,
		get: function() {
			return index_1.Neovim;
		}
	});
	Object.defineProperty(exports, "Tabpage", {
		enumerable: true,
		get: function() {
			return index_1.Tabpage;
		}
	});
	Object.defineProperty(exports, "Window", {
		enumerable: true,
		get: function() {
			return index_1.Window;
		}
	});
	var attach_1 = require_attach();
	Object.defineProperty(exports, "attach", {
		enumerable: true,
		get: function() {
			return attach_1.attach;
		}
	});
}));
//#endregion
//#region ../node_modules/ms/index.js
var require_ms$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Helpers.
	*/
	var s = 1e3;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;
	/**
	* Parse or format the given `val`.
	*
	* Options:
	*
	*  - `long` verbose formatting [false]
	*
	* @param {String|Number} val
	* @param {Object} [options]
	* @throws {Error} throw an error if val is not a non-empty string or a number
	* @return {String|Number}
	* @api public
	*/
	module.exports = function(val, options) {
		options = options || {};
		var type = typeof val;
		if (type === "string" && val.length > 0) return parse(val);
		else if (type === "number" && isFinite(val)) return options.long ? fmtLong(val) : fmtShort(val);
		throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
	};
	/**
	* Parse the given `str` and return milliseconds.
	*
	* @param {String} str
	* @return {Number}
	* @api private
	*/
	function parse(str) {
		str = String(str);
		if (str.length > 100) return;
		var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
		if (!match) return;
		var n = parseFloat(match[1]);
		switch ((match[2] || "ms").toLowerCase()) {
			case "years":
			case "year":
			case "yrs":
			case "yr":
			case "y": return n * y;
			case "weeks":
			case "week":
			case "w": return n * w;
			case "days":
			case "day":
			case "d": return n * d;
			case "hours":
			case "hour":
			case "hrs":
			case "hr":
			case "h": return n * h;
			case "minutes":
			case "minute":
			case "mins":
			case "min":
			case "m": return n * m;
			case "seconds":
			case "second":
			case "secs":
			case "sec":
			case "s": return n * s;
			case "milliseconds":
			case "millisecond":
			case "msecs":
			case "msec":
			case "ms": return n;
			default: return;
		}
	}
	/**
	* Short format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtShort(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return Math.round(ms / d) + "d";
		if (msAbs >= h) return Math.round(ms / h) + "h";
		if (msAbs >= m) return Math.round(ms / m) + "m";
		if (msAbs >= s) return Math.round(ms / s) + "s";
		return ms + "ms";
	}
	/**
	* Long format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtLong(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return plural(ms, msAbs, d, "day");
		if (msAbs >= h) return plural(ms, msAbs, h, "hour");
		if (msAbs >= m) return plural(ms, msAbs, m, "minute");
		if (msAbs >= s) return plural(ms, msAbs, s, "second");
		return ms + " ms";
	}
	/**
	* Pluralization helper.
	*/
	function plural(ms, msAbs, n, name) {
		var isPlural = msAbs >= n * 1.5;
		return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
	}
}));
//#endregion
//#region ../node_modules/debug/src/common.js
var require_common$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This is the common logic for both the Node.js and web browser
	* implementations of `debug()`.
	*/
	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = require_ms$1();
		createDebug.destroy = destroy;
		Object.keys(env).forEach((key) => {
			createDebug[key] = env[key];
		});
		/**
		* The currently active debug mode names, and names to skip.
		*/
		createDebug.names = [];
		createDebug.skips = [];
		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};
		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;
			for (let i = 0; i < namespace.length; i++) {
				hash = (hash << 5) - hash + namespace.charCodeAt(i);
				hash |= 0;
			}
			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;
		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;
			function debug(...args) {
				if (!debug.enabled) return;
				const self = debug;
				const curr = Number(/* @__PURE__ */ new Date());
				self.diff = curr - (prevTime || curr);
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;
				args[0] = createDebug.coerce(args[0]);
				if (typeof args[0] !== "string") args.unshift("%O");
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					if (match === "%%") return "%";
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === "function") {
						const val = args[index];
						match = formatter.call(self, val);
						args.splice(index, 1);
						index--;
					}
					return match;
				});
				createDebug.formatArgs.call(self, args);
				(self.log || createDebug.log).apply(self, args);
			}
			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy;
			Object.defineProperty(debug, "enabled", {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) return enableOverride;
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}
					return enabledCache;
				},
				set: (v) => {
					enableOverride = v;
				}
			});
			if (typeof createDebug.init === "function") createDebug.init(debug);
			return debug;
		}
		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}
		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;
			createDebug.names = [];
			createDebug.skips = [];
			const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
			for (const ns of split) if (ns[0] === "-") createDebug.skips.push(ns.slice(1));
			else createDebug.names.push(ns);
		}
		/**
		* Checks if the given string matches a namespace template, honoring
		* asterisks as wildcards.
		*
		* @param {String} search
		* @param {String} template
		* @return {Boolean}
		*/
		function matchesTemplate(search, template) {
			let searchIndex = 0;
			let templateIndex = 0;
			let starIndex = -1;
			let matchIndex = 0;
			while (searchIndex < search.length) if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
				if (template[templateIndex] === "*") {
					starIndex = templateIndex;
					matchIndex = searchIndex;
					templateIndex++;
				} else {
					searchIndex++;
					templateIndex++;
				}
			} else if (starIndex !== -1) {
				templateIndex = starIndex + 1;
				matchIndex++;
				searchIndex = matchIndex;
			} else return false;
			while (templateIndex < template.length && template[templateIndex] === "*") templateIndex++;
			return templateIndex === template.length;
		}
		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [...createDebug.names, ...createDebug.skips.map((namespace) => "-" + namespace)].join(",");
			createDebug.enable("");
			return namespaces;
		}
		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			for (const skip of createDebug.skips) if (matchesTemplate(name, skip)) return false;
			for (const ns of createDebug.names) if (matchesTemplate(name, ns)) return true;
			return false;
		}
		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) return val.stack || val.message;
			return val;
		}
		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
		}
		createDebug.enable(createDebug.load());
		return createDebug;
	}
	module.exports = setup;
}));
//#endregion
//#region ../node_modules/debug/src/browser.js
var require_browser$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This is the web browser implementation of `debug()`.
	*/
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();
	exports.destroy = (() => {
		let warned = false;
		return () => {
			if (!warned) {
				warned = true;
				console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
			}
		};
	})();
	/**
	* Colors.
	*/
	exports.colors = [
		"#0000CC",
		"#0000FF",
		"#0033CC",
		"#0033FF",
		"#0066CC",
		"#0066FF",
		"#0099CC",
		"#0099FF",
		"#00CC00",
		"#00CC33",
		"#00CC66",
		"#00CC99",
		"#00CCCC",
		"#00CCFF",
		"#3300CC",
		"#3300FF",
		"#3333CC",
		"#3333FF",
		"#3366CC",
		"#3366FF",
		"#3399CC",
		"#3399FF",
		"#33CC00",
		"#33CC33",
		"#33CC66",
		"#33CC99",
		"#33CCCC",
		"#33CCFF",
		"#6600CC",
		"#6600FF",
		"#6633CC",
		"#6633FF",
		"#66CC00",
		"#66CC33",
		"#9900CC",
		"#9900FF",
		"#9933CC",
		"#9933FF",
		"#99CC00",
		"#99CC33",
		"#CC0000",
		"#CC0033",
		"#CC0066",
		"#CC0099",
		"#CC00CC",
		"#CC00FF",
		"#CC3300",
		"#CC3333",
		"#CC3366",
		"#CC3399",
		"#CC33CC",
		"#CC33FF",
		"#CC6600",
		"#CC6633",
		"#CC9900",
		"#CC9933",
		"#CCCC00",
		"#CCCC33",
		"#FF0000",
		"#FF0033",
		"#FF0066",
		"#FF0099",
		"#FF00CC",
		"#FF00FF",
		"#FF3300",
		"#FF3333",
		"#FF3366",
		"#FF3399",
		"#FF33CC",
		"#FF33FF",
		"#FF6600",
		"#FF6633",
		"#FF9900",
		"#FF9933",
		"#FFCC00",
		"#FFCC33"
	];
	/**
	* Currently only WebKit-based Web Inspectors, Firefox >= v31,
	* and the Firebug extension (any Firefox version) are known
	* to support "%c" CSS customizations.
	*
	* TODO: add a `localStorage` variable to explicitly enable/disable colors
	*/
	function useColors() {
		if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) return true;
		if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) return false;
		let m;
		return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
	}
	/**
	* Colorize log arguments if enabled.
	*
	* @api public
	*/
	function formatArgs(args) {
		args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
		if (!this.useColors) return;
		const c = "color: " + this.color;
		args.splice(1, 0, c, "color: inherit");
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, (match) => {
			if (match === "%%") return;
			index++;
			if (match === "%c") lastC = index;
		});
		args.splice(lastC, 0, c);
	}
	/**
	* Invokes `console.debug()` when available.
	* No-op when `console.debug` is not a "function".
	* If `console.debug` is not available, falls back
	* to `console.log`.
	*
	* @api public
	*/
	exports.log = console.debug || console.log || (() => {});
	/**
	* Save `namespaces`.
	*
	* @param {String} namespaces
	* @api private
	*/
	function save(namespaces) {
		try {
			if (namespaces) exports.storage.setItem("debug", namespaces);
			else exports.storage.removeItem("debug");
		} catch (error) {}
	}
	/**
	* Load `namespaces`.
	*
	* @return {String} returns the previously persisted debug modes
	* @api private
	*/
	function load() {
		let r;
		try {
			r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
		} catch (error) {}
		if (!r && typeof process !== "undefined" && "env" in process) r = process.env.DEBUG;
		return r;
	}
	/**
	* Localstorage attempts to return the localstorage.
	*
	* This is necessary because safari throws
	* when a user disables cookies/localstorage
	* and you attempt to access it.
	*
	* @return {LocalStorage}
	* @api private
	*/
	function localstorage() {
		try {
			return localStorage;
		} catch (error) {}
	}
	module.exports = require_common$1()(exports);
	var { formatters } = module.exports;
	/**
	* Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	*/
	formatters.j = function(v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return "[UnexpectedJSONParseError]: " + error.message;
		}
	};
}));
//#endregion
//#region ../node_modules/debug/src/node.js
var require_node$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Module dependencies.
	*/
	var tty$1 = require("tty");
	var util$4 = require("util");
	/**
	* This is the Node.js implementation of `debug()`.
	*/
	exports.init = init;
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.destroy = util$4.deprecate(() => {}, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
	/**
	* Colors.
	*/
	exports.colors = [
		6,
		2,
		3,
		4,
		5,
		1
	];
	try {
		const supportsColor = require("supports-color");
		if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	} catch (error) {}
	/**
	* Build up the default `inspectOpts` object from the environment variables.
	*
	*   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
	*/
	exports.inspectOpts = Object.keys(process.env).filter((key) => {
		return /^debug_/i.test(key);
	}).reduce((obj, key) => {
		const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});
		let val = process.env[key];
		if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
		else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
		else if (val === "null") val = null;
		else val = Number(val);
		obj[prop] = val;
		return obj;
	}, {});
	/**
	* Is stdout a TTY? Colored output is enabled when `true`.
	*/
	function useColors() {
		return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty$1.isatty(process.stderr.fd);
	}
	/**
	* Adds ANSI color escape codes if enabled.
	*
	* @api public
	*/
	function formatArgs(args) {
		const { namespace: name, useColors } = this;
		if (useColors) {
			const c = this.color;
			const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
			const prefix = `  ${colorCode};1m${name} \u001B[0m`;
			args[0] = prefix + args[0].split("\n").join("\n" + prefix);
			args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
		} else args[0] = getDate() + name + " " + args[0];
	}
	function getDate() {
		if (exports.inspectOpts.hideDate) return "";
		return (/* @__PURE__ */ new Date()).toISOString() + " ";
	}
	/**
	* Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
	*/
	function log(...args) {
		return process.stderr.write(util$4.formatWithOptions(exports.inspectOpts, ...args) + "\n");
	}
	/**
	* Save `namespaces`.
	*
	* @param {String} namespaces
	* @api private
	*/
	function save(namespaces) {
		if (namespaces) process.env.DEBUG = namespaces;
		else delete process.env.DEBUG;
	}
	/**
	* Load `namespaces`.
	*
	* @return {String} returns the previously persisted debug modes
	* @api private
	*/
	function load() {
		return process.env.DEBUG;
	}
	/**
	* Init logic for `debug` instances.
	*
	* Create a new `inspectOpts` object in case `useColors` is set
	* differently for a particular `debug` instance.
	*/
	function init(debug) {
		debug.inspectOpts = {};
		const keys = Object.keys(exports.inspectOpts);
		for (let i = 0; i < keys.length; i++) debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
	module.exports = require_common$1()(exports);
	var { formatters } = module.exports;
	/**
	* Map %o to `util.inspect()`, all on a single line.
	*/
	formatters.o = function(v) {
		this.inspectOpts.colors = this.useColors;
		return util$4.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
	};
	/**
	* Map %O to `util.inspect()`, allowing multiple lines if needed.
	*/
	formatters.O = function(v) {
		this.inspectOpts.colors = this.useColors;
		return util$4.inspect(v, this.inspectOpts);
	};
}));
//#endregion
//#region ../node_modules/debug/src/index.js
var require_src$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Detect Electron renderer / nwjs process, which is node, but we should
	* treat as a browser.
	*/
	if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) module.exports = require_browser$1();
	else module.exports = require_node$1();
}));
//#endregion
//#region ../node_modules/rfdc/index.js
var require_rfdc = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = rfdc;
	function copyBuffer(cur) {
		if (cur instanceof Buffer) return Buffer.from(cur);
		return new cur.constructor(cur.buffer.slice(), cur.byteOffset, cur.length);
	}
	function rfdc(opts) {
		opts = opts || {};
		if (opts.circles) return rfdcCircles(opts);
		const constructorHandlers = /* @__PURE__ */ new Map();
		constructorHandlers.set(Date, (o) => new Date(o));
		constructorHandlers.set(Map, (o, fn) => new Map(cloneArray(Array.from(o), fn)));
		constructorHandlers.set(Set, (o, fn) => new Set(cloneArray(Array.from(o), fn)));
		if (opts.constructorHandlers) for (const handler of opts.constructorHandlers) constructorHandlers.set(handler[0], handler[1]);
		let handler = null;
		return opts.proto ? cloneProto : clone;
		function cloneArray(a, fn) {
			const keys = Object.keys(a);
			const a2 = new Array(keys.length);
			for (let i = 0; i < keys.length; i++) {
				const k = keys[i];
				const cur = a[k];
				if (typeof cur !== "object" || cur === null) a2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) a2[k] = handler(cur, fn);
				else if (ArrayBuffer.isView(cur)) a2[k] = copyBuffer(cur);
				else a2[k] = fn(cur);
			}
			return a2;
		}
		function clone(o) {
			if (typeof o !== "object" || o === null) return o;
			if (Array.isArray(o)) return cloneArray(o, clone);
			if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) return handler(o, clone);
			const o2 = {};
			for (const k in o) {
				if (Object.hasOwnProperty.call(o, k) === false) continue;
				const cur = o[k];
				if (typeof cur !== "object" || cur === null) o2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) o2[k] = handler(cur, clone);
				else if (ArrayBuffer.isView(cur)) o2[k] = copyBuffer(cur);
				else o2[k] = clone(cur);
			}
			return o2;
		}
		function cloneProto(o) {
			if (typeof o !== "object" || o === null) return o;
			if (Array.isArray(o)) return cloneArray(o, cloneProto);
			if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) return handler(o, cloneProto);
			const o2 = {};
			for (const k in o) {
				const cur = o[k];
				if (typeof cur !== "object" || cur === null) o2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) o2[k] = handler(cur, cloneProto);
				else if (ArrayBuffer.isView(cur)) o2[k] = copyBuffer(cur);
				else o2[k] = cloneProto(cur);
			}
			return o2;
		}
	}
	function rfdcCircles(opts) {
		const refs = [];
		const refsNew = [];
		const constructorHandlers = /* @__PURE__ */ new Map();
		constructorHandlers.set(Date, (o) => new Date(o));
		constructorHandlers.set(Map, (o, fn) => new Map(cloneArray(Array.from(o), fn)));
		constructorHandlers.set(Set, (o, fn) => new Set(cloneArray(Array.from(o), fn)));
		if (opts.constructorHandlers) for (const handler of opts.constructorHandlers) constructorHandlers.set(handler[0], handler[1]);
		let handler = null;
		return opts.proto ? cloneProto : clone;
		function cloneArray(a, fn) {
			const keys = Object.keys(a);
			const a2 = new Array(keys.length);
			for (let i = 0; i < keys.length; i++) {
				const k = keys[i];
				const cur = a[k];
				if (typeof cur !== "object" || cur === null) a2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) a2[k] = handler(cur, fn);
				else if (ArrayBuffer.isView(cur)) a2[k] = copyBuffer(cur);
				else {
					const index = refs.indexOf(cur);
					if (index !== -1) a2[k] = refsNew[index];
					else a2[k] = fn(cur);
				}
			}
			return a2;
		}
		function clone(o) {
			if (typeof o !== "object" || o === null) return o;
			if (Array.isArray(o)) return cloneArray(o, clone);
			if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) return handler(o, clone);
			const o2 = {};
			refs.push(o);
			refsNew.push(o2);
			for (const k in o) {
				if (Object.hasOwnProperty.call(o, k) === false) continue;
				const cur = o[k];
				if (typeof cur !== "object" || cur === null) o2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) o2[k] = handler(cur, clone);
				else if (ArrayBuffer.isView(cur)) o2[k] = copyBuffer(cur);
				else {
					const i = refs.indexOf(cur);
					if (i !== -1) o2[k] = refsNew[i];
					else o2[k] = clone(cur);
				}
			}
			refs.pop();
			refsNew.pop();
			return o2;
		}
		function cloneProto(o) {
			if (typeof o !== "object" || o === null) return o;
			if (Array.isArray(o)) return cloneArray(o, cloneProto);
			if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) return handler(o, cloneProto);
			const o2 = {};
			refs.push(o);
			refsNew.push(o2);
			for (const k in o) {
				const cur = o[k];
				if (typeof cur !== "object" || cur === null) o2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) o2[k] = handler(cur, cloneProto);
				else if (ArrayBuffer.isView(cur)) o2[k] = copyBuffer(cur);
				else {
					const i = refs.indexOf(cur);
					if (i !== -1) o2[k] = refsNew[i];
					else o2[k] = cloneProto(cur);
				}
			}
			refs.pop();
			refsNew.pop();
			return o2;
		}
	}
}));
//#endregion
//#region ../node_modules/log4js/lib/configuration.js
var require_configuration = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util$3 = require("util");
	var debug = require_src$1()("log4js:configuration");
	var preProcessingListeners = [];
	var listeners = [];
	var not = (thing) => !thing;
	var anObject = (thing) => thing && typeof thing === "object" && !Array.isArray(thing);
	var validIdentifier = (thing) => /^[A-Za-z][A-Za-z0-9_]*$/g.test(thing);
	var anInteger = (thing) => thing && typeof thing === "number" && Number.isInteger(thing);
	var addListener = (fn) => {
		listeners.push(fn);
		debug(`Added listener, now ${listeners.length} listeners`);
	};
	var addPreProcessingListener = (fn) => {
		preProcessingListeners.push(fn);
		debug(`Added pre-processing listener, now ${preProcessingListeners.length} listeners`);
	};
	var throwExceptionIf = (config, checks, message) => {
		(Array.isArray(checks) ? checks : [checks]).forEach((test) => {
			if (test) throw new Error(`Problem with log4js configuration: (${util$3.inspect(config, { depth: 5 })}) - ${message}`);
		});
	};
	var configure = (candidate) => {
		debug("New configuration to be validated: ", candidate);
		throwExceptionIf(candidate, not(anObject(candidate)), "must be an object.");
		debug(`Calling pre-processing listeners (${preProcessingListeners.length})`);
		preProcessingListeners.forEach((listener) => listener(candidate));
		debug("Configuration pre-processing finished.");
		debug(`Calling configuration listeners (${listeners.length})`);
		listeners.forEach((listener) => listener(candidate));
		debug("Configuration finished.");
	};
	module.exports = {
		configure,
		addListener,
		addPreProcessingListener,
		throwExceptionIf,
		anObject,
		anInteger,
		validIdentifier,
		not
	};
}));
//#endregion
//#region ../node_modules/date-format/lib/index.js
var require_lib$3 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function padWithZeros(vNumber, width) {
		var numAsString = vNumber.toString();
		while (numAsString.length < width) numAsString = "0" + numAsString;
		return numAsString;
	}
	function addZero(vNumber) {
		return padWithZeros(vNumber, 2);
	}
	/**
	* Formats the TimeOffset
	* Thanks to http://www.svendtofte.com/code/date_format/
	* @private
	*/
	function offset(timezoneOffset) {
		var os = Math.abs(timezoneOffset);
		var h = String(Math.floor(os / 60));
		var m = String(os % 60);
		h = ("0" + h).slice(-2);
		m = ("0" + m).slice(-2);
		return timezoneOffset === 0 ? "Z" : (timezoneOffset < 0 ? "+" : "-") + h + ":" + m;
	}
	function asString(format, date) {
		if (typeof format !== "string") {
			date = format;
			format = module.exports.ISO8601_FORMAT;
		}
		if (!date) date = module.exports.now();
		var vDay = addZero(date.getDate());
		var vMonth = addZero(date.getMonth() + 1);
		var vYearLong = addZero(date.getFullYear());
		var vYearShort = addZero(vYearLong.substring(2, 4));
		var vYear = format.indexOf("yyyy") > -1 ? vYearLong : vYearShort;
		var vHour = addZero(date.getHours());
		var vMinute = addZero(date.getMinutes());
		var vSecond = addZero(date.getSeconds());
		var vMillisecond = padWithZeros(date.getMilliseconds(), 3);
		var vTimeZone = offset(date.getTimezoneOffset());
		return format.replace(/dd/g, vDay).replace(/MM/g, vMonth).replace(/y{1,4}/g, vYear).replace(/hh/g, vHour).replace(/mm/g, vMinute).replace(/ss/g, vSecond).replace(/SSS/g, vMillisecond).replace(/O/g, vTimeZone);
	}
	function setDatePart(date, part, value, local) {
		date["set" + (local ? "" : "UTC") + part](value);
	}
	function extractDateParts(pattern, str, missingValuesDate) {
		var local = pattern.indexOf("O") < 0;
		var monthOverflow = false;
		var matchers = [
			{
				pattern: /y{1,4}/,
				regexp: "\\d{1,4}",
				fn: function(date, value) {
					setDatePart(date, "FullYear", value, local);
				}
			},
			{
				pattern: /MM/,
				regexp: "\\d{1,2}",
				fn: function(date, value) {
					setDatePart(date, "Month", value - 1, local);
					if (date.getMonth() !== value - 1) monthOverflow = true;
				}
			},
			{
				pattern: /dd/,
				regexp: "\\d{1,2}",
				fn: function(date, value) {
					if (monthOverflow) setDatePart(date, "Month", date.getMonth() - 1, local);
					setDatePart(date, "Date", value, local);
				}
			},
			{
				pattern: /hh/,
				regexp: "\\d{1,2}",
				fn: function(date, value) {
					setDatePart(date, "Hours", value, local);
				}
			},
			{
				pattern: /mm/,
				regexp: "\\d\\d",
				fn: function(date, value) {
					setDatePart(date, "Minutes", value, local);
				}
			},
			{
				pattern: /ss/,
				regexp: "\\d\\d",
				fn: function(date, value) {
					setDatePart(date, "Seconds", value, local);
				}
			},
			{
				pattern: /SSS/,
				regexp: "\\d\\d\\d",
				fn: function(date, value) {
					setDatePart(date, "Milliseconds", value, local);
				}
			},
			{
				pattern: /O/,
				regexp: "[+-]\\d{1,2}:?\\d{2}?|Z",
				fn: function(date, value) {
					if (value === "Z") value = 0;
					else value = value.replace(":", "");
					var offset = Math.abs(value);
					var timezoneOffset = (value > 0 ? -1 : 1) * (offset % 100 + Math.floor(offset / 100) * 60);
					date.setUTCMinutes(date.getUTCMinutes() + timezoneOffset);
				}
			}
		];
		var parsedPattern = matchers.reduce(function(p, m) {
			if (m.pattern.test(p.regexp)) {
				m.index = p.regexp.match(m.pattern).index;
				p.regexp = p.regexp.replace(m.pattern, "(" + m.regexp + ")");
			} else m.index = -1;
			return p;
		}, {
			regexp: pattern,
			index: []
		});
		var dateFns = matchers.filter(function(m) {
			return m.index > -1;
		});
		dateFns.sort(function(a, b) {
			return a.index - b.index;
		});
		var matches = new RegExp(parsedPattern.regexp).exec(str);
		if (matches) {
			var date = missingValuesDate || module.exports.now();
			dateFns.forEach(function(f, i) {
				f.fn(date, matches[i + 1]);
			});
			return date;
		}
		throw new Error("String '" + str + "' could not be parsed as '" + pattern + "'");
	}
	function parse(pattern, str, missingValuesDate) {
		if (!pattern) throw new Error("pattern must be supplied");
		return extractDateParts(pattern, str, missingValuesDate);
	}
	/**
	* Used for testing - replace this function with a fixed date.
	*/
	function now() {
		return /* @__PURE__ */ new Date();
	}
	module.exports = asString;
	module.exports.asString = asString;
	module.exports.parse = parse;
	module.exports.now = now;
	module.exports.ISO8601_FORMAT = "yyyy-MM-ddThh:mm:ss.SSS";
	module.exports.ISO8601_WITH_TZ_OFFSET_FORMAT = "yyyy-MM-ddThh:mm:ss.SSSO";
	module.exports.DATETIME_FORMAT = "dd MM yyyy hh:mm:ss.SSS";
	module.exports.ABSOLUTETIME_FORMAT = "hh:mm:ss.SSS";
}));
//#endregion
//#region ../node_modules/log4js/lib/layouts.js
var require_layouts = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var dateFormat = require_lib$3();
	var os$7 = require("os");
	var util$2 = require("util");
	var path$26 = require("path");
	var url = require("url");
	var debug = require_src$1()("log4js:layouts");
	var styles = {
		bold: [1, 22],
		italic: [3, 23],
		underline: [4, 24],
		inverse: [7, 27],
		white: [37, 39],
		grey: [90, 39],
		black: [90, 39],
		blue: [34, 39],
		cyan: [36, 39],
		green: [32, 39],
		magenta: [35, 39],
		red: [91, 39],
		yellow: [33, 39]
	};
	function colorizeStart(style) {
		return style ? `\x1B[${styles[style][0]}m` : "";
	}
	function colorizeEnd(style) {
		return style ? `\x1B[${styles[style][1]}m` : "";
	}
	/**
	* Taken from masylum's fork (https://github.com/masylum/log4js-node)
	*/
	function colorize(str, style) {
		return colorizeStart(style) + str + colorizeEnd(style);
	}
	function timestampLevelAndCategory(loggingEvent, colour) {
		return colorize(util$2.format("[%s] [%s] %s - ", dateFormat.asString(loggingEvent.startTime), loggingEvent.level.toString(), loggingEvent.categoryName), colour);
	}
	/**
	* BasicLayout is a simple layout for storing the logs. The logs are stored
	* in following format:
	* <pre>
	* [startTime] [logLevel] categoryName - message\n
	* </pre>
	*
	* @author Stephan Strittmatter
	*/
	function basicLayout(loggingEvent) {
		return timestampLevelAndCategory(loggingEvent) + util$2.format(...loggingEvent.data);
	}
	/**
	* colouredLayout - taken from masylum's fork.
	* same as basicLayout, but with colours.
	*/
	function colouredLayout(loggingEvent) {
		return timestampLevelAndCategory(loggingEvent, loggingEvent.level.colour) + util$2.format(...loggingEvent.data);
	}
	function messagePassThroughLayout(loggingEvent) {
		return util$2.format(...loggingEvent.data);
	}
	function dummyLayout(loggingEvent) {
		return loggingEvent.data[0];
	}
	/**
	* PatternLayout
	* Format for specifiers is %[padding].[truncation][field]{[format]}
	* e.g. %5.10p - left pad the log level by 5 characters, up to a max of 10
	* both padding and truncation can be negative.
	* Negative truncation = trunc from end of string
	* Positive truncation = trunc from start of string
	* Negative padding = pad right
	* Positive padding = pad left
	*
	* Fields can be any of:
	*  - %r time in toLocaleTimeString format
	*  - %p log level
	*  - %c log category
	*  - %h hostname
	*  - %m log data
	*  - %m{l} where l is an integer, log data.slice(l)
	*  - %m{l,u} where l and u are integers, log data.slice(l, u)
	*  - %d date in constious formats
	*  - %% %
	*  - %n newline
	*  - %z pid
	*  - %f filename
	*  - %l line number
	*  - %o column postion
	*  - %s call stack
	*  - %C class name [#1316](https://github.com/log4js-node/log4js-node/pull/1316)
	*  - %M method or function name [#1316](https://github.com/log4js-node/log4js-node/pull/1316)
	*  - %A method or function alias [#1316](https://github.com/log4js-node/log4js-node/pull/1316)
	*  - %F fully qualified caller name [#1316](https://github.com/log4js-node/log4js-node/pull/1316)
	*  - %x{<tokenname>} add dynamic tokens to your log. Tokens are specified in the tokens parameter
	*  - %X{<tokenname>} add dynamic tokens to your log. Tokens are specified in logger context
	* You can use %[ and %] to define a colored block.
	*
	* Tokens are specified as simple key:value objects.
	* The key represents the token name whereas the value can be a string or function
	* which is called to extract the value to put in the log message. If token is not
	* found, it doesn't replace the field.
	*
	* A sample token would be: { 'pid' : function() { return process.pid; } }
	*
	* Takes a pattern string, array of tokens and returns a layout function.
	* @return {Function}
	* @param pattern
	* @param tokens
	* @param timezoneOffset
	*
	* @authors ['Stephan Strittmatter', 'Jan Schmidle']
	*/
	function patternLayout(pattern, tokens) {
		const TTCC_CONVERSION_PATTERN = "%r %p %c - %m%n";
		const regex = /%(-?[0-9]+)?(\.?-?[0-9]+)?([[\]cdhmnprzxXyflosCMAF%])(\{([^}]+)\})?|([^%]+)/;
		pattern = pattern || TTCC_CONVERSION_PATTERN;
		function categoryName(loggingEvent, specifier) {
			let loggerName = loggingEvent.categoryName;
			if (specifier) {
				const precision = parseInt(specifier, 10);
				const loggerNameBits = loggerName.split(".");
				if (precision < loggerNameBits.length) loggerName = loggerNameBits.slice(loggerNameBits.length - precision).join(".");
			}
			return loggerName;
		}
		function formatAsDate(loggingEvent, specifier) {
			let format = dateFormat.ISO8601_FORMAT;
			if (specifier) {
				format = specifier;
				switch (format) {
					case "ISO8601":
					case "ISO8601_FORMAT":
						format = dateFormat.ISO8601_FORMAT;
						break;
					case "ISO8601_WITH_TZ_OFFSET":
					case "ISO8601_WITH_TZ_OFFSET_FORMAT":
						format = dateFormat.ISO8601_WITH_TZ_OFFSET_FORMAT;
						break;
					case "ABSOLUTE":
						process.emitWarning("Pattern %d{ABSOLUTE} is deprecated in favor of %d{ABSOLUTETIME}. Please use %d{ABSOLUTETIME} instead.", "DeprecationWarning", "log4js-node-DEP0003");
						debug("[log4js-node-DEP0003]", "DEPRECATION: Pattern %d{ABSOLUTE} is deprecated and replaced by %d{ABSOLUTETIME}.");
					case "ABSOLUTETIME":
					case "ABSOLUTETIME_FORMAT":
						format = dateFormat.ABSOLUTETIME_FORMAT;
						break;
					case "DATE":
						process.emitWarning("Pattern %d{DATE} is deprecated due to the confusion it causes when used. Please use %d{DATETIME} instead.", "DeprecationWarning", "log4js-node-DEP0004");
						debug("[log4js-node-DEP0004]", "DEPRECATION: Pattern %d{DATE} is deprecated and replaced by %d{DATETIME}.");
					case "DATETIME":
					case "DATETIME_FORMAT": format = dateFormat.DATETIME_FORMAT;
				}
			}
			return dateFormat.asString(format, loggingEvent.startTime);
		}
		function hostname() {
			return os$7.hostname().toString();
		}
		function formatMessage(loggingEvent, specifier) {
			let dataSlice = loggingEvent.data;
			if (specifier) {
				const [lowerBound, upperBound] = specifier.split(",");
				dataSlice = dataSlice.slice(lowerBound, upperBound);
			}
			return util$2.format(...dataSlice);
		}
		function endOfLine() {
			return os$7.EOL;
		}
		function logLevel(loggingEvent) {
			return loggingEvent.level.toString();
		}
		function startTime(loggingEvent) {
			return dateFormat.asString("hh:mm:ss", loggingEvent.startTime);
		}
		function startColour(loggingEvent) {
			return colorizeStart(loggingEvent.level.colour);
		}
		function endColour(loggingEvent) {
			return colorizeEnd(loggingEvent.level.colour);
		}
		function percent() {
			return "%";
		}
		function pid(loggingEvent) {
			return loggingEvent && loggingEvent.pid ? loggingEvent.pid.toString() : process.pid.toString();
		}
		function clusterInfo() {
			return pid();
		}
		function userDefined(loggingEvent, specifier) {
			if (typeof tokens[specifier] !== "undefined") return typeof tokens[specifier] === "function" ? tokens[specifier](loggingEvent) : tokens[specifier];
			return null;
		}
		function contextDefined(loggingEvent, specifier) {
			const resolver = loggingEvent.context[specifier];
			if (typeof resolver !== "undefined") return typeof resolver === "function" ? resolver(loggingEvent) : resolver;
			return null;
		}
		function fileName(loggingEvent, specifier) {
			let filename = loggingEvent.fileName || "";
			/* istanbul ignore next: unsure how to simulate ESM for test coverage */
			const convertFileURLToPath = function(filepath) {
				const urlPrefix = "file://";
				if (filepath.startsWith(urlPrefix)) {
					if (typeof url.fileURLToPath === "function") filepath = url.fileURLToPath(filepath);
					else {
						filepath = path$26.normalize(filepath.replace(new RegExp(`^${urlPrefix}`), ""));
						if (process.platform === "win32") {
							if (filepath.startsWith("\\")) filepath = filepath.slice(1);
							else filepath = path$26.sep + path$26.sep + filepath;
						}
					}
				}
				return filepath;
			};
			filename = convertFileURLToPath(filename);
			if (specifier) {
				const fileDepth = parseInt(specifier, 10);
				const fileList = filename.split(path$26.sep);
				if (fileList.length > fileDepth) filename = fileList.slice(-fileDepth).join(path$26.sep);
			}
			return filename;
		}
		function lineNumber(loggingEvent) {
			return loggingEvent.lineNumber ? `${loggingEvent.lineNumber}` : "";
		}
		function columnNumber(loggingEvent) {
			return loggingEvent.columnNumber ? `${loggingEvent.columnNumber}` : "";
		}
		function callStack(loggingEvent) {
			return loggingEvent.callStack || "";
		}
		function className(loggingEvent) {
			return loggingEvent.className || "";
		}
		function functionName(loggingEvent) {
			return loggingEvent.functionName || "";
		}
		function functionAlias(loggingEvent) {
			return loggingEvent.functionAlias || "";
		}
		function callerName(loggingEvent) {
			return loggingEvent.callerName || "";
		}
		const replacers = {
			c: categoryName,
			d: formatAsDate,
			h: hostname,
			m: formatMessage,
			n: endOfLine,
			p: logLevel,
			r: startTime,
			"[": startColour,
			"]": endColour,
			y: clusterInfo,
			z: pid,
			"%": percent,
			x: userDefined,
			X: contextDefined,
			f: fileName,
			l: lineNumber,
			o: columnNumber,
			s: callStack,
			C: className,
			M: functionName,
			A: functionAlias,
			F: callerName
		};
		function replaceToken(conversionCharacter, loggingEvent, specifier) {
			return replacers[conversionCharacter](loggingEvent, specifier);
		}
		function truncate(truncation, toTruncate) {
			let len;
			if (truncation) {
				len = parseInt(truncation.slice(1), 10);
				return len > 0 ? toTruncate.slice(0, len) : toTruncate.slice(len);
			}
			return toTruncate;
		}
		function pad(padding, toPad) {
			let len;
			if (padding) {
				if (padding.charAt(0) === "-") {
					len = parseInt(padding.slice(1), 10);
					while (toPad.length < len) toPad += " ";
				} else {
					len = parseInt(padding, 10);
					while (toPad.length < len) toPad = ` ${toPad}`;
				}
			}
			return toPad;
		}
		function truncateAndPad(toTruncAndPad, truncation, padding) {
			let replacement = toTruncAndPad;
			replacement = truncate(truncation, replacement);
			replacement = pad(padding, replacement);
			return replacement;
		}
		return function(loggingEvent) {
			let formattedString = "";
			let result;
			let searchString = pattern;
			while ((result = regex.exec(searchString)) !== null) {
				const padding = result[1];
				const truncation = result[2];
				const conversionCharacter = result[3];
				const specifier = result[5];
				const text = result[6];
				if (text) formattedString += text.toString();
				else {
					const replacement = replaceToken(conversionCharacter, loggingEvent, specifier);
					formattedString += truncateAndPad(replacement, truncation, padding);
				}
				searchString = searchString.slice(result.index + result[0].length);
			}
			return formattedString;
		};
	}
	var layoutMakers = {
		messagePassThrough() {
			return messagePassThroughLayout;
		},
		basic() {
			return basicLayout;
		},
		colored() {
			return colouredLayout;
		},
		coloured() {
			return colouredLayout;
		},
		pattern(config) {
			return patternLayout(config && config.pattern, config && config.tokens);
		},
		dummy() {
			return dummyLayout;
		}
	};
	module.exports = {
		basicLayout,
		messagePassThroughLayout,
		patternLayout,
		colouredLayout,
		coloredLayout: colouredLayout,
		dummyLayout,
		addLayout(name, serializerGenerator) {
			layoutMakers[name] = serializerGenerator;
		},
		layout(name, config) {
			return layoutMakers[name] && layoutMakers[name](config);
		}
	};
}));
//#endregion
//#region ../node_modules/log4js/lib/levels.js
var require_levels = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var configuration = require_configuration();
	var validColours = [
		"white",
		"grey",
		"black",
		"blue",
		"cyan",
		"green",
		"magenta",
		"red",
		"yellow"
	];
	var Level = class Level {
		constructor(level, levelStr, colour) {
			this.level = level;
			this.levelStr = levelStr;
			this.colour = colour;
		}
		toString() {
			return this.levelStr;
		}
		/**
		* converts given String to corresponding Level
		* @param {(Level|string)} sArg -- String value of Level OR Log4js.Level
		* @param {Level} [defaultLevel] -- default Level, if no String representation
		* @return {Level}
		*/
		static getLevel(sArg, defaultLevel) {
			if (!sArg) return defaultLevel;
			if (sArg instanceof Level) return sArg;
			if (sArg instanceof Object && sArg.levelStr) sArg = sArg.levelStr;
			return Level[sArg.toString().toUpperCase()] || defaultLevel;
		}
		static addLevels(customLevels) {
			if (customLevels) {
				Object.keys(customLevels).forEach((l) => {
					const levelStr = l.toUpperCase();
					Level[levelStr] = new Level(customLevels[l].value, levelStr, customLevels[l].colour);
					const existingLevelIndex = Level.levels.findIndex((lvl) => lvl.levelStr === levelStr);
					if (existingLevelIndex > -1) Level.levels[existingLevelIndex] = Level[levelStr];
					else Level.levels.push(Level[levelStr]);
				});
				Level.levels.sort((a, b) => a.level - b.level);
			}
		}
		isLessThanOrEqualTo(otherLevel) {
			if (typeof otherLevel === "string") otherLevel = Level.getLevel(otherLevel);
			return this.level <= otherLevel.level;
		}
		isGreaterThanOrEqualTo(otherLevel) {
			if (typeof otherLevel === "string") otherLevel = Level.getLevel(otherLevel);
			return this.level >= otherLevel.level;
		}
		isEqualTo(otherLevel) {
			if (typeof otherLevel === "string") otherLevel = Level.getLevel(otherLevel);
			return this.level === otherLevel.level;
		}
	};
	Level.levels = [];
	Level.addLevels({
		ALL: {
			value: Number.MIN_VALUE,
			colour: "grey"
		},
		TRACE: {
			value: 5e3,
			colour: "blue"
		},
		DEBUG: {
			value: 1e4,
			colour: "cyan"
		},
		INFO: {
			value: 2e4,
			colour: "green"
		},
		WARN: {
			value: 3e4,
			colour: "yellow"
		},
		ERROR: {
			value: 4e4,
			colour: "red"
		},
		FATAL: {
			value: 5e4,
			colour: "magenta"
		},
		MARK: {
			value: 9007199254740992,
			colour: "grey"
		},
		OFF: {
			value: Number.MAX_VALUE,
			colour: "grey"
		}
	});
	configuration.addListener((config) => {
		const levelConfig = config.levels;
		if (levelConfig) {
			configuration.throwExceptionIf(config, configuration.not(configuration.anObject(levelConfig)), "levels must be an object");
			Object.keys(levelConfig).forEach((l) => {
				configuration.throwExceptionIf(config, configuration.not(configuration.validIdentifier(l)), `level name "${l}" is not a valid identifier (must start with a letter, only contain A-Z,a-z,0-9,_)`);
				configuration.throwExceptionIf(config, configuration.not(configuration.anObject(levelConfig[l])), `level "${l}" must be an object`);
				configuration.throwExceptionIf(config, configuration.not(levelConfig[l].value), `level "${l}" must have a 'value' property`);
				configuration.throwExceptionIf(config, configuration.not(configuration.anInteger(levelConfig[l].value)), `level "${l}".value must have an integer value`);
				configuration.throwExceptionIf(config, configuration.not(levelConfig[l].colour), `level "${l}" must have a 'colour' property`);
				configuration.throwExceptionIf(config, configuration.not(validColours.indexOf(levelConfig[l].colour) > -1), `level "${l}".colour must be one of ${validColours.join(", ")}`);
			});
		}
	});
	configuration.addListener((config) => {
		Level.addLevels(config.levels);
	});
	module.exports = Level;
}));
//#endregion
//#region ../node_modules/flatted/cjs/index.js
var require_cjs$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var { parse: $parse, stringify: $stringify } = JSON;
	var { keys } = Object;
	var Primitive = String;
	var primitive = "string";
	var ignore = {};
	var object = "object";
	var noop = (_, value) => value;
	var primitives = (value) => value instanceof Primitive ? Primitive(value) : value;
	var Primitives = (_, value) => typeof value === primitive ? new Primitive(value) : value;
	var resolver = (input, lazy, parsed, $) => (output) => {
		for (let ke = keys(output), { length } = ke, y = 0; y < length; y++) {
			const k = ke[y];
			const value = output[k];
			if (value instanceof Primitive) {
				const tmp = input[+value];
				if (typeof tmp === object && !parsed.has(tmp)) {
					parsed.add(tmp);
					output[k] = ignore;
					lazy.push({
						o: output,
						k,
						r: tmp
					});
				} else output[k] = $.call(output, k, tmp);
			} else if (output[k] !== ignore) output[k] = $.call(output, k, value);
		}
		return output;
	};
	var set = (known, input, value) => {
		const index = Primitive(input.push(value) - 1);
		known.set(value, index);
		return index;
	};
	/**
	* Converts a specialized flatted string into a JS value.
	* @param {string} text
	* @param {(this: any, key: string, value: any) => any} [reviver]
	* @returns {any}
	*/
	var parse = (text, reviver) => {
		const input = $parse(text, Primitives).map(primitives);
		const $ = reviver || noop;
		let value = input[0];
		if (typeof value === object && value) {
			const lazy = [];
			const revive = resolver(input, lazy, /* @__PURE__ */ new Set(), $);
			value = revive(value);
			let i = 0;
			while (i < lazy.length) {
				const { o, k, r } = lazy[i++];
				o[k] = $.call(o, k, revive(r));
			}
		}
		return $.call({ "": value }, "", value);
	};
	exports.parse = parse;
	/**
	* Converts a JS value into a specialized flatted string.
	* @param {any} value
	* @param {((this: any, key: string, value: any) => any) | (string | number)[] | null | undefined} [replacer]
	* @param {string | number | undefined} [space]
	* @returns {string}
	*/
	var stringify = (value, replacer, space) => {
		const $ = replacer && typeof replacer === object ? (k, v) => k === "" || -1 < replacer.indexOf(k) ? v : void 0 : replacer || noop;
		const known = /* @__PURE__ */ new Map();
		const input = [];
		const output = [];
		let i = +set(known, input, $.call({ "": value }, "", value));
		let firstRun = !i;
		while (i < input.length) {
			firstRun = true;
			output[i] = $stringify(input[i++], replace, space);
		}
		return "[" + output.join(",") + "]";
		function replace(key, value) {
			if (firstRun) {
				firstRun = !firstRun;
				return value;
			}
			const after = $.call(this, key, value);
			switch (typeof after) {
				case object: if (after === null) return after;
				case primitive: return known.get(after) || set(known, input, after);
			}
			return after;
		}
	};
	exports.stringify = stringify;
	/**
	* Converts a generic value into a JSON serializable object without losing recursion.
	* @param {any} value
	* @returns {any}
	*/
	var toJSON = (value) => $parse(stringify(value));
	exports.toJSON = toJSON;
	/**
	* Converts a previously serialized object with recursion into a recursive one.
	* @param {any} value
	* @returns {any}
	*/
	var fromJSON = (value) => parse($stringify(value));
	exports.fromJSON = fromJSON;
}));
//#endregion
//#region ../node_modules/log4js/lib/LoggingEvent.js
var require_LoggingEvent = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var flatted = require_cjs$2();
	var levels = require_levels();
	var SerDe = class {
		constructor() {
			const deserialise = {
				__LOG4JS_undefined__: void 0,
				__LOG4JS_NaN__: NaN,
				__LOG4JS_Infinity__: 1 / 0,
				"__LOG4JS_-Infinity__": -1 / 0
			};
			this.deMap = deserialise;
			this.serMap = {};
			Object.keys(this.deMap).forEach((key) => {
				const value = this.deMap[key];
				this.serMap[value] = key;
			});
		}
		canSerialise(key) {
			if (typeof key === "string") return false;
			return key in this.serMap;
		}
		serialise(key) {
			if (this.canSerialise(key)) return this.serMap[key];
			return key;
		}
		canDeserialise(key) {
			return key in this.deMap;
		}
		deserialise(key) {
			if (this.canDeserialise(key)) return this.deMap[key];
			return key;
		}
	};
	var serde = new SerDe();
	module.exports = class LoggingEvent {
		/**
		* Models a logging event.
		* @constructor
		* @param {string} categoryName name of category
		* @param {Log4js.Level} level level of message
		* @param {Array} data objects to log
		* @param {Error} [error]
		* @author Seth Chisamore
		*/
		constructor(categoryName, level, data, context, location, error) {
			this.startTime = /* @__PURE__ */ new Date();
			this.categoryName = categoryName;
			this.data = data;
			this.level = level;
			this.context = Object.assign({}, context);
			this.pid = process.pid;
			this.error = error;
			if (typeof location !== "undefined") {
				if (!location || typeof location !== "object" || Array.isArray(location)) throw new TypeError("Invalid location type passed to LoggingEvent constructor");
				this.constructor._getLocationKeys().forEach((key) => {
					if (typeof location[key] !== "undefined") this[key] = location[key];
				});
			}
		}
		/** @private */
		static _getLocationKeys() {
			return [
				"fileName",
				"lineNumber",
				"columnNumber",
				"callStack",
				"className",
				"functionName",
				"functionAlias",
				"callerName"
			];
		}
		serialise() {
			return flatted.stringify(this, (key, value) => {
				if (value instanceof Error) value = Object.assign({
					message: value.message,
					stack: value.stack
				}, value);
				return serde.serialise(value);
			});
		}
		static deserialise(serialised) {
			let event;
			try {
				const rehydratedEvent = flatted.parse(serialised, (key, value) => {
					if (value && value.message && value.stack) {
						const fakeError = new Error(value);
						Object.keys(value).forEach((k) => {
							fakeError[k] = value[k];
						});
						value = fakeError;
					}
					return serde.deserialise(value);
				});
				this._getLocationKeys().forEach((key) => {
					if (typeof rehydratedEvent[key] !== "undefined") {
						if (!rehydratedEvent.location) rehydratedEvent.location = {};
						rehydratedEvent.location[key] = rehydratedEvent[key];
					}
				});
				event = new LoggingEvent(rehydratedEvent.categoryName, levels.getLevel(rehydratedEvent.level.levelStr), rehydratedEvent.data, rehydratedEvent.context, rehydratedEvent.location, rehydratedEvent.error);
				event.startTime = new Date(rehydratedEvent.startTime);
				event.pid = rehydratedEvent.pid;
				if (rehydratedEvent.cluster) event.cluster = rehydratedEvent.cluster;
			} catch (e) {
				event = new LoggingEvent("log4js", levels.ERROR, [
					"Unable to parse log:",
					serialised,
					"because: ",
					e
				]);
			}
			return event;
		}
	};
}));
//#endregion
//#region ../node_modules/log4js/lib/clustering.js
var require_clustering = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("log4js:clustering");
	var LoggingEvent = require_LoggingEvent();
	var configuration = require_configuration();
	var disabled = false;
	var cluster = null;
	try {
		cluster = require("cluster");
	} catch (e) {
		debug("cluster module not present");
		disabled = true;
	}
	var listeners = [];
	var pm2 = false;
	var pm2InstanceVar = "NODE_APP_INSTANCE";
	var isPM2Master = () => pm2 && process.env[pm2InstanceVar] === "0";
	var isMaster = () => disabled || cluster && cluster.isMaster || isPM2Master();
	var sendToListeners = (logEvent) => {
		listeners.forEach((l) => l(logEvent));
	};
	var receiver = (worker, message) => {
		debug("cluster message received from worker ", worker, ": ", message);
		if (worker.topic && worker.data) {
			message = worker;
			worker = void 0;
		}
		if (message && message.topic && message.topic === "log4js:message") {
			debug("received message: ", message.data);
			sendToListeners(LoggingEvent.deserialise(message.data));
		}
	};
	if (!disabled) configuration.addListener((config) => {
		listeners.length = 0;
		({pm2, disableClustering: disabled, pm2InstanceVar = "NODE_APP_INSTANCE"} = config);
		debug(`clustering disabled ? ${disabled}`);
		debug(`cluster.isMaster ? ${cluster && cluster.isMaster}`);
		debug(`pm2 enabled ? ${pm2}`);
		debug(`pm2InstanceVar = ${pm2InstanceVar}`);
		debug(`process.env[${pm2InstanceVar}] = ${process.env[pm2InstanceVar]}`);
		if (pm2) process.removeListener("message", receiver);
		if (cluster && cluster.removeListener) cluster.removeListener("message", receiver);
		if (disabled || config.disableClustering) debug("Not listening for cluster messages, because clustering disabled.");
		else if (isPM2Master()) {
			debug("listening for PM2 broadcast messages");
			process.on("message", receiver);
		} else if (cluster && cluster.isMaster) {
			debug("listening for cluster messages");
			cluster.on("message", receiver);
		} else debug("not listening for messages, because we are not a master process");
	});
	module.exports = {
		onlyOnMaster: (fn, notMaster) => isMaster() ? fn() : notMaster,
		isMaster,
		send: (msg) => {
			if (isMaster()) sendToListeners(msg);
			else {
				if (!pm2) msg.cluster = {
					workerId: cluster.worker.id,
					worker: process.pid
				};
				process.send({
					topic: "log4js:message",
					data: msg.serialise()
				});
			}
		},
		onMessage: (listener) => {
			listeners.push(listener);
		}
	};
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/adapters.js
var require_adapters = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function maxFileSizeUnitTransform(maxLogSize) {
		if (typeof maxLogSize === "number" && Number.isInteger(maxLogSize)) return maxLogSize;
		const units = {
			K: 1024,
			M: 1048576,
			G: 1073741824
		};
		const validUnit = Object.keys(units);
		const unit = maxLogSize.slice(-1).toLocaleUpperCase();
		const value = maxLogSize.slice(0, -1).trim();
		if (validUnit.indexOf(unit) < 0 || !Number.isInteger(Number(value))) throw Error(`maxLogSize: "${maxLogSize}" is invalid`);
		else return value * units[unit];
	}
	function adapter(configAdapter, config) {
		const newConfig = Object.assign({}, config);
		Object.keys(configAdapter).forEach((key) => {
			if (newConfig[key]) newConfig[key] = configAdapter[key](config[key]);
		});
		return newConfig;
	}
	function fileAppenderAdapter(config) {
		return adapter({ maxLogSize: maxFileSizeUnitTransform }, config);
	}
	var adapters = {
		dateFile: fileAppenderAdapter,
		file: fileAppenderAdapter,
		fileSync: fileAppenderAdapter
	};
	module.exports.modifyConfig = (config) => adapters[config.type] ? adapters[config.type](config) : config;
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/console.js
var require_console = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var consoleLog = console.log.bind(console);
	function consoleAppender(layout, timezoneOffset) {
		return (loggingEvent) => {
			consoleLog(layout(loggingEvent, timezoneOffset));
		};
	}
	function configure(config, layouts) {
		let layout = layouts.colouredLayout;
		if (config.layout) layout = layouts.layout(config.layout.type, config.layout);
		return consoleAppender(layout, config.timezoneOffset);
	}
	module.exports.configure = configure;
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/stdout.js
var require_stdout = /* @__PURE__ */ __commonJSMin(((exports) => {
	function stdoutAppender(layout, timezoneOffset) {
		return (loggingEvent) => {
			process.stdout.write(`${layout(loggingEvent, timezoneOffset)}\n`);
		};
	}
	function configure(config, layouts) {
		let layout = layouts.colouredLayout;
		if (config.layout) layout = layouts.layout(config.layout.type, config.layout);
		return stdoutAppender(layout, config.timezoneOffset);
	}
	exports.configure = configure;
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/stderr.js
var require_stderr = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function stderrAppender(layout, timezoneOffset) {
		return (loggingEvent) => {
			process.stderr.write(`${layout(loggingEvent, timezoneOffset)}\n`);
		};
	}
	function configure(config, layouts) {
		let layout = layouts.colouredLayout;
		if (config.layout) layout = layouts.layout(config.layout.type, config.layout);
		return stderrAppender(layout, config.timezoneOffset);
	}
	module.exports.configure = configure;
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/logLevelFilter.js
var require_logLevelFilter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function logLevelFilter(minLevelString, maxLevelString, appender, levels) {
		const minLevel = levels.getLevel(minLevelString);
		const maxLevel = levels.getLevel(maxLevelString, levels.FATAL);
		return (logEvent) => {
			const eventLevel = logEvent.level;
			if (minLevel.isLessThanOrEqualTo(eventLevel) && maxLevel.isGreaterThanOrEqualTo(eventLevel)) appender(logEvent);
		};
	}
	function configure(config, layouts, findAppender, levels) {
		const appender = findAppender(config.appender);
		return logLevelFilter(config.level, config.maxLevel, appender, levels);
	}
	module.exports.configure = configure;
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/categoryFilter.js
var require_categoryFilter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("log4js:categoryFilter");
	function categoryFilter(excludes, appender) {
		if (typeof excludes === "string") excludes = [excludes];
		return (logEvent) => {
			debug(`Checking ${logEvent.categoryName} against ${excludes}`);
			if (excludes.indexOf(logEvent.categoryName) === -1) {
				debug("Not excluded, sending to appender");
				appender(logEvent);
			}
		};
	}
	function configure(config, layouts, findAppender) {
		const appender = findAppender(config.appender);
		return categoryFilter(config.exclude, appender);
	}
	module.exports.configure = configure;
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/noLogFilter.js
var require_noLogFilter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("log4js:noLogFilter");
	/**
	* The function removes empty or null regexp from the array
	* @param {string[]} regexp
	* @returns {string[]} a filtered string array with not empty or null regexp
	*/
	function removeNullOrEmptyRegexp(regexp) {
		return regexp.filter((el) => el != null && el !== "");
	}
	/**
	* Returns a function that will exclude the events in case they match
	* with the regular expressions provided
	* @param {(string|string[])} filters contains the regexp that will be used for the evaluation
	* @param {*} appender
	* @returns {function}
	*/
	function noLogFilter(filters, appender) {
		return (logEvent) => {
			debug(`Checking data: ${logEvent.data} against filters: ${filters}`);
			if (typeof filters === "string") filters = [filters];
			filters = removeNullOrEmptyRegexp(filters);
			const regex = new RegExp(filters.join("|"), "i");
			if (filters.length === 0 || logEvent.data.findIndex((value) => regex.test(value)) < 0) {
				debug("Not excluded, sending to appender");
				appender(logEvent);
			}
		};
	}
	function configure(config, layouts, findAppender) {
		const appender = findAppender(config.appender);
		return noLogFilter(config.exclude, appender);
	}
	module.exports.configure = configure;
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/universalify/index.js
var require_universalify = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.fromCallback = function(fn) {
		return Object.defineProperty(function() {
			if (typeof arguments[arguments.length - 1] === "function") fn.apply(this, arguments);
			else return new Promise((resolve, reject) => {
				arguments[arguments.length] = (err, res) => {
					if (err) return reject(err);
					resolve(res);
				};
				arguments.length++;
				fn.apply(this, arguments);
			});
		}, "name", { value: fn.name });
	};
	exports.fromPromise = function(fn) {
		return Object.defineProperty(function() {
			const cb = arguments[arguments.length - 1];
			if (typeof cb !== "function") return fn.apply(this, arguments);
			else fn.apply(this, arguments).then((r) => cb(null, r), cb);
		}, "name", { value: fn.name });
	};
}));
//#endregion
//#region ../node_modules/graceful-fs/polyfills.js
var require_polyfills = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var constants = require("constants");
	var origCwd = process.cwd;
	var cwd = null;
	var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
	process.cwd = function() {
		if (!cwd) cwd = origCwd.call(process);
		return cwd;
	};
	try {
		process.cwd();
	} catch (er) {}
	if (typeof process.chdir === "function") {
		var chdir = process.chdir;
		process.chdir = function(d) {
			cwd = null;
			chdir.call(process, d);
		};
		if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
	}
	module.exports = patch;
	function patch(fs) {
		if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) patchLchmod(fs);
		if (!fs.lutimes) patchLutimes(fs);
		fs.chown = chownFix(fs.chown);
		fs.fchown = chownFix(fs.fchown);
		fs.lchown = chownFix(fs.lchown);
		fs.chmod = chmodFix(fs.chmod);
		fs.fchmod = chmodFix(fs.fchmod);
		fs.lchmod = chmodFix(fs.lchmod);
		fs.chownSync = chownFixSync(fs.chownSync);
		fs.fchownSync = chownFixSync(fs.fchownSync);
		fs.lchownSync = chownFixSync(fs.lchownSync);
		fs.chmodSync = chmodFixSync(fs.chmodSync);
		fs.fchmodSync = chmodFixSync(fs.fchmodSync);
		fs.lchmodSync = chmodFixSync(fs.lchmodSync);
		fs.stat = statFix(fs.stat);
		fs.fstat = statFix(fs.fstat);
		fs.lstat = statFix(fs.lstat);
		fs.statSync = statFixSync(fs.statSync);
		fs.fstatSync = statFixSync(fs.fstatSync);
		fs.lstatSync = statFixSync(fs.lstatSync);
		if (fs.chmod && !fs.lchmod) {
			fs.lchmod = function(path, mode, cb) {
				if (cb) process.nextTick(cb);
			};
			fs.lchmodSync = function() {};
		}
		if (fs.chown && !fs.lchown) {
			fs.lchown = function(path, uid, gid, cb) {
				if (cb) process.nextTick(cb);
			};
			fs.lchownSync = function() {};
		}
		if (platform === "win32") fs.rename = typeof fs.rename !== "function" ? fs.rename : (function(fs$rename) {
			function rename(from, to, cb) {
				var start = Date.now();
				var backoff = 0;
				fs$rename(from, to, function CB(er) {
					if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
						setTimeout(function() {
							fs.stat(to, function(stater, st) {
								if (stater && stater.code === "ENOENT") fs$rename(from, to, CB);
								else cb(er);
							});
						}, backoff);
						if (backoff < 100) backoff += 10;
						return;
					}
					if (cb) cb(er);
				});
			}
			if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename);
			return rename;
		})(fs.rename);
		fs.read = typeof fs.read !== "function" ? fs.read : (function(fs$read) {
			function read(fd, buffer, offset, length, position, callback_) {
				var callback;
				if (callback_ && typeof callback_ === "function") {
					var eagCounter = 0;
					callback = function(er, _, __) {
						if (er && er.code === "EAGAIN" && eagCounter < 10) {
							eagCounter++;
							return fs$read.call(fs, fd, buffer, offset, length, position, callback);
						}
						callback_.apply(this, arguments);
					};
				}
				return fs$read.call(fs, fd, buffer, offset, length, position, callback);
			}
			if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
			return read;
		})(fs.read);
		fs.readSync = typeof fs.readSync !== "function" ? fs.readSync : (function(fs$readSync) {
			return function(fd, buffer, offset, length, position) {
				var eagCounter = 0;
				while (true) try {
					return fs$readSync.call(fs, fd, buffer, offset, length, position);
				} catch (er) {
					if (er.code === "EAGAIN" && eagCounter < 10) {
						eagCounter++;
						continue;
					}
					throw er;
				}
			};
		})(fs.readSync);
		function patchLchmod(fs) {
			fs.lchmod = function(path, mode, callback) {
				fs.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
					if (err) {
						if (callback) callback(err);
						return;
					}
					fs.fchmod(fd, mode, function(err) {
						fs.close(fd, function(err2) {
							if (callback) callback(err || err2);
						});
					});
				});
			};
			fs.lchmodSync = function(path, mode) {
				var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
				var threw = true;
				var ret;
				try {
					ret = fs.fchmodSync(fd, mode);
					threw = false;
				} finally {
					if (threw) try {
						fs.closeSync(fd);
					} catch (er) {}
					else fs.closeSync(fd);
				}
				return ret;
			};
		}
		function patchLutimes(fs) {
			if (constants.hasOwnProperty("O_SYMLINK") && fs.futimes) {
				fs.lutimes = function(path, at, mt, cb) {
					fs.open(path, constants.O_SYMLINK, function(er, fd) {
						if (er) {
							if (cb) cb(er);
							return;
						}
						fs.futimes(fd, at, mt, function(er) {
							fs.close(fd, function(er2) {
								if (cb) cb(er || er2);
							});
						});
					});
				};
				fs.lutimesSync = function(path, at, mt) {
					var fd = fs.openSync(path, constants.O_SYMLINK);
					var ret;
					var threw = true;
					try {
						ret = fs.futimesSync(fd, at, mt);
						threw = false;
					} finally {
						if (threw) try {
							fs.closeSync(fd);
						} catch (er) {}
						else fs.closeSync(fd);
					}
					return ret;
				};
			} else if (fs.futimes) {
				fs.lutimes = function(_a, _b, _c, cb) {
					if (cb) process.nextTick(cb);
				};
				fs.lutimesSync = function() {};
			}
		}
		function chmodFix(orig) {
			if (!orig) return orig;
			return function(target, mode, cb) {
				return orig.call(fs, target, mode, function(er) {
					if (chownErOk(er)) er = null;
					if (cb) cb.apply(this, arguments);
				});
			};
		}
		function chmodFixSync(orig) {
			if (!orig) return orig;
			return function(target, mode) {
				try {
					return orig.call(fs, target, mode);
				} catch (er) {
					if (!chownErOk(er)) throw er;
				}
			};
		}
		function chownFix(orig) {
			if (!orig) return orig;
			return function(target, uid, gid, cb) {
				return orig.call(fs, target, uid, gid, function(er) {
					if (chownErOk(er)) er = null;
					if (cb) cb.apply(this, arguments);
				});
			};
		}
		function chownFixSync(orig) {
			if (!orig) return orig;
			return function(target, uid, gid) {
				try {
					return orig.call(fs, target, uid, gid);
				} catch (er) {
					if (!chownErOk(er)) throw er;
				}
			};
		}
		function statFix(orig) {
			if (!orig) return orig;
			return function(target, options, cb) {
				if (typeof options === "function") {
					cb = options;
					options = null;
				}
				function callback(er, stats) {
					if (stats) {
						if (stats.uid < 0) stats.uid += 4294967296;
						if (stats.gid < 0) stats.gid += 4294967296;
					}
					if (cb) cb.apply(this, arguments);
				}
				return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
			};
		}
		function statFixSync(orig) {
			if (!orig) return orig;
			return function(target, options) {
				var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
				if (stats) {
					if (stats.uid < 0) stats.uid += 4294967296;
					if (stats.gid < 0) stats.gid += 4294967296;
				}
				return stats;
			};
		}
		function chownErOk(er) {
			if (!er) return true;
			if (er.code === "ENOSYS") return true;
			if (!process.getuid || process.getuid() !== 0) {
				if (er.code === "EINVAL" || er.code === "EPERM") return true;
			}
			return false;
		}
	}
}));
//#endregion
//#region ../node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Stream = require("stream").Stream;
	module.exports = legacy;
	function legacy(fs) {
		return {
			ReadStream,
			WriteStream
		};
		function ReadStream(path, options) {
			if (!(this instanceof ReadStream)) return new ReadStream(path, options);
			Stream.call(this);
			var self = this;
			this.path = path;
			this.fd = null;
			this.readable = true;
			this.paused = false;
			this.flags = "r";
			this.mode = 438;
			this.bufferSize = 65536;
			options = options || {};
			var keys = Object.keys(options);
			for (var index = 0, length = keys.length; index < length; index++) {
				var key = keys[index];
				this[key] = options[key];
			}
			if (this.encoding) this.setEncoding(this.encoding);
			if (this.start !== void 0) {
				if ("number" !== typeof this.start) throw TypeError("start must be a Number");
				if (this.end === void 0) this.end = Infinity;
				else if ("number" !== typeof this.end) throw TypeError("end must be a Number");
				if (this.start > this.end) throw new Error("start must be <= end");
				this.pos = this.start;
			}
			if (this.fd !== null) {
				process.nextTick(function() {
					self._read();
				});
				return;
			}
			fs.open(this.path, this.flags, this.mode, function(err, fd) {
				if (err) {
					self.emit("error", err);
					self.readable = false;
					return;
				}
				self.fd = fd;
				self.emit("open", fd);
				self._read();
			});
		}
		function WriteStream(path, options) {
			if (!(this instanceof WriteStream)) return new WriteStream(path, options);
			Stream.call(this);
			this.path = path;
			this.fd = null;
			this.writable = true;
			this.flags = "w";
			this.encoding = "binary";
			this.mode = 438;
			this.bytesWritten = 0;
			options = options || {};
			var keys = Object.keys(options);
			for (var index = 0, length = keys.length; index < length; index++) {
				var key = keys[index];
				this[key] = options[key];
			}
			if (this.start !== void 0) {
				if ("number" !== typeof this.start) throw TypeError("start must be a Number");
				if (this.start < 0) throw new Error("start must be >= zero");
				this.pos = this.start;
			}
			this.busy = false;
			this._queue = [];
			if (this.fd === null) {
				this._open = fs.open;
				this._queue.push([
					this._open,
					this.path,
					this.flags,
					this.mode,
					void 0
				]);
				this.flush();
			}
		}
	}
}));
//#endregion
//#region ../node_modules/graceful-fs/clone.js
var require_clone = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = clone;
	var getPrototypeOf = Object.getPrototypeOf || function(obj) {
		return obj.__proto__;
	};
	function clone(obj) {
		if (obj === null || typeof obj !== "object") return obj;
		if (obj instanceof Object) var copy = { __proto__: getPrototypeOf(obj) };
		else var copy = Object.create(null);
		Object.getOwnPropertyNames(obj).forEach(function(key) {
			Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
		});
		return copy;
	}
}));
//#endregion
//#region ../node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs$5 = require("fs");
	var polyfills = require_polyfills();
	var legacy = require_legacy_streams();
	var clone = require_clone();
	var util$1 = require("util");
	/* istanbul ignore next - node 0.x polyfill */
	var gracefulQueue;
	var previousSymbol;
	/* istanbul ignore else - node 0.x polyfill */
	if (typeof Symbol === "function" && typeof Symbol.for === "function") {
		gracefulQueue = Symbol.for("graceful-fs.queue");
		previousSymbol = Symbol.for("graceful-fs.previous");
	} else {
		gracefulQueue = "___graceful-fs.queue";
		previousSymbol = "___graceful-fs.previous";
	}
	function noop() {}
	function publishQueue(context, queue) {
		Object.defineProperty(context, gracefulQueue, { get: function() {
			return queue;
		} });
	}
	var debug = noop;
	if (util$1.debuglog) debug = util$1.debuglog("gfs4");
	else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) debug = function() {
		var m = util$1.format.apply(util$1, arguments);
		m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
		console.error(m);
	};
	if (!fs$5[gracefulQueue]) {
		publishQueue(fs$5, global[gracefulQueue] || []);
		fs$5.close = (function(fs$close) {
			function close(fd, cb) {
				return fs$close.call(fs$5, fd, function(err) {
					if (!err) resetQueue();
					if (typeof cb === "function") cb.apply(this, arguments);
				});
			}
			Object.defineProperty(close, previousSymbol, { value: fs$close });
			return close;
		})(fs$5.close);
		fs$5.closeSync = (function(fs$closeSync) {
			function closeSync(fd) {
				fs$closeSync.apply(fs$5, arguments);
				resetQueue();
			}
			Object.defineProperty(closeSync, previousSymbol, { value: fs$closeSync });
			return closeSync;
		})(fs$5.closeSync);
		if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) process.on("exit", function() {
			debug(fs$5[gracefulQueue]);
			require("assert").equal(fs$5[gracefulQueue].length, 0);
		});
	}
	if (!global[gracefulQueue]) publishQueue(global, fs$5[gracefulQueue]);
	module.exports = patch(clone(fs$5));
	if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$5.__patched) {
		module.exports = patch(fs$5);
		fs$5.__patched = true;
	}
	function patch(fs) {
		polyfills(fs);
		fs.gracefulify = patch;
		fs.createReadStream = createReadStream;
		fs.createWriteStream = createWriteStream;
		var fs$readFile = fs.readFile;
		fs.readFile = readFile;
		function readFile(path, options, cb) {
			if (typeof options === "function") cb = options, options = null;
			return go$readFile(path, options, cb);
			function go$readFile(path, options, cb, startTime) {
				return fs$readFile(path, options, function(err) {
					if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([
						go$readFile,
						[
							path,
							options,
							cb
						],
						err,
						startTime || Date.now(),
						Date.now()
					]);
					else if (typeof cb === "function") cb.apply(this, arguments);
				});
			}
		}
		var fs$writeFile = fs.writeFile;
		fs.writeFile = writeFile;
		function writeFile(path, data, options, cb) {
			if (typeof options === "function") cb = options, options = null;
			return go$writeFile(path, data, options, cb);
			function go$writeFile(path, data, options, cb, startTime) {
				return fs$writeFile(path, data, options, function(err) {
					if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([
						go$writeFile,
						[
							path,
							data,
							options,
							cb
						],
						err,
						startTime || Date.now(),
						Date.now()
					]);
					else if (typeof cb === "function") cb.apply(this, arguments);
				});
			}
		}
		var fs$appendFile = fs.appendFile;
		if (fs$appendFile) fs.appendFile = appendFile;
		function appendFile(path, data, options, cb) {
			if (typeof options === "function") cb = options, options = null;
			return go$appendFile(path, data, options, cb);
			function go$appendFile(path, data, options, cb, startTime) {
				return fs$appendFile(path, data, options, function(err) {
					if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([
						go$appendFile,
						[
							path,
							data,
							options,
							cb
						],
						err,
						startTime || Date.now(),
						Date.now()
					]);
					else if (typeof cb === "function") cb.apply(this, arguments);
				});
			}
		}
		var fs$copyFile = fs.copyFile;
		if (fs$copyFile) fs.copyFile = copyFile;
		function copyFile(src, dest, flags, cb) {
			if (typeof flags === "function") {
				cb = flags;
				flags = 0;
			}
			return go$copyFile(src, dest, flags, cb);
			function go$copyFile(src, dest, flags, cb, startTime) {
				return fs$copyFile(src, dest, flags, function(err) {
					if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([
						go$copyFile,
						[
							src,
							dest,
							flags,
							cb
						],
						err,
						startTime || Date.now(),
						Date.now()
					]);
					else if (typeof cb === "function") cb.apply(this, arguments);
				});
			}
		}
		var fs$readdir = fs.readdir;
		fs.readdir = readdir;
		var noReaddirOptionVersions = /^v[0-5]\./;
		function readdir(path, options, cb) {
			if (typeof options === "function") cb = options, options = null;
			var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir(path, options, cb, startTime) {
				return fs$readdir(path, fs$readdirCallback(path, options, cb, startTime));
			} : function go$readdir(path, options, cb, startTime) {
				return fs$readdir(path, options, fs$readdirCallback(path, options, cb, startTime));
			};
			return go$readdir(path, options, cb);
			function fs$readdirCallback(path, options, cb, startTime) {
				return function(err, files) {
					if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([
						go$readdir,
						[
							path,
							options,
							cb
						],
						err,
						startTime || Date.now(),
						Date.now()
					]);
					else {
						if (files && files.sort) files.sort();
						if (typeof cb === "function") cb.call(this, err, files);
					}
				};
			}
		}
		if (process.version.substr(0, 4) === "v0.8") {
			var legStreams = legacy(fs);
			ReadStream = legStreams.ReadStream;
			WriteStream = legStreams.WriteStream;
		}
		var fs$ReadStream = fs.ReadStream;
		if (fs$ReadStream) {
			ReadStream.prototype = Object.create(fs$ReadStream.prototype);
			ReadStream.prototype.open = ReadStream$open;
		}
		var fs$WriteStream = fs.WriteStream;
		if (fs$WriteStream) {
			WriteStream.prototype = Object.create(fs$WriteStream.prototype);
			WriteStream.prototype.open = WriteStream$open;
		}
		Object.defineProperty(fs, "ReadStream", {
			get: function() {
				return ReadStream;
			},
			set: function(val) {
				ReadStream = val;
			},
			enumerable: true,
			configurable: true
		});
		Object.defineProperty(fs, "WriteStream", {
			get: function() {
				return WriteStream;
			},
			set: function(val) {
				WriteStream = val;
			},
			enumerable: true,
			configurable: true
		});
		var FileReadStream = ReadStream;
		Object.defineProperty(fs, "FileReadStream", {
			get: function() {
				return FileReadStream;
			},
			set: function(val) {
				FileReadStream = val;
			},
			enumerable: true,
			configurable: true
		});
		var FileWriteStream = WriteStream;
		Object.defineProperty(fs, "FileWriteStream", {
			get: function() {
				return FileWriteStream;
			},
			set: function(val) {
				FileWriteStream = val;
			},
			enumerable: true,
			configurable: true
		});
		function ReadStream(path, options) {
			if (this instanceof ReadStream) return fs$ReadStream.apply(this, arguments), this;
			else return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
		}
		function ReadStream$open() {
			var that = this;
			open(that.path, that.flags, that.mode, function(err, fd) {
				if (err) {
					if (that.autoClose) that.destroy();
					that.emit("error", err);
				} else {
					that.fd = fd;
					that.emit("open", fd);
					that.read();
				}
			});
		}
		function WriteStream(path, options) {
			if (this instanceof WriteStream) return fs$WriteStream.apply(this, arguments), this;
			else return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
		}
		function WriteStream$open() {
			var that = this;
			open(that.path, that.flags, that.mode, function(err, fd) {
				if (err) {
					that.destroy();
					that.emit("error", err);
				} else {
					that.fd = fd;
					that.emit("open", fd);
				}
			});
		}
		function createReadStream(path, options) {
			return new fs.ReadStream(path, options);
		}
		function createWriteStream(path, options) {
			return new fs.WriteStream(path, options);
		}
		var fs$open = fs.open;
		fs.open = open;
		function open(path, flags, mode, cb) {
			if (typeof mode === "function") cb = mode, mode = null;
			return go$open(path, flags, mode, cb);
			function go$open(path, flags, mode, cb, startTime) {
				return fs$open(path, flags, mode, function(err, fd) {
					if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([
						go$open,
						[
							path,
							flags,
							mode,
							cb
						],
						err,
						startTime || Date.now(),
						Date.now()
					]);
					else if (typeof cb === "function") cb.apply(this, arguments);
				});
			}
		}
		return fs;
	}
	function enqueue(elem) {
		debug("ENQUEUE", elem[0].name, elem[1]);
		fs$5[gracefulQueue].push(elem);
		retry();
	}
	var retryTimer;
	function resetQueue() {
		var now = Date.now();
		for (var i = 0; i < fs$5[gracefulQueue].length; ++i) if (fs$5[gracefulQueue][i].length > 2) {
			fs$5[gracefulQueue][i][3] = now;
			fs$5[gracefulQueue][i][4] = now;
		}
		retry();
	}
	function retry() {
		clearTimeout(retryTimer);
		retryTimer = void 0;
		if (fs$5[gracefulQueue].length === 0) return;
		var elem = fs$5[gracefulQueue].shift();
		var fn = elem[0];
		var args = elem[1];
		var err = elem[2];
		var startTime = elem[3];
		var lastTime = elem[4];
		if (startTime === void 0) {
			debug("RETRY", fn.name, args);
			fn.apply(null, args);
		} else if (Date.now() - startTime >= 6e4) {
			debug("TIMEOUT", fn.name, args);
			var cb = args.pop();
			if (typeof cb === "function") cb.call(null, err);
		} else {
			var sinceAttempt = Date.now() - lastTime;
			var sinceStart = Math.max(lastTime - startTime, 1);
			if (sinceAttempt >= Math.min(sinceStart * 1.2, 100)) {
				debug("RETRY", fn.name, args);
				fn.apply(null, args.concat([startTime]));
			} else fs$5[gracefulQueue].push(elem);
		}
		if (retryTimer === void 0) retryTimer = setTimeout(retry, 0);
	}
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/fs/index.js
var require_fs = /* @__PURE__ */ __commonJSMin(((exports) => {
	var u = require_universalify().fromCallback;
	var fs = require_graceful_fs();
	var api = [
		"access",
		"appendFile",
		"chmod",
		"chown",
		"close",
		"copyFile",
		"fchmod",
		"fchown",
		"fdatasync",
		"fstat",
		"fsync",
		"ftruncate",
		"futimes",
		"lchown",
		"lchmod",
		"link",
		"lstat",
		"mkdir",
		"mkdtemp",
		"open",
		"readFile",
		"readdir",
		"readlink",
		"realpath",
		"rename",
		"rmdir",
		"stat",
		"symlink",
		"truncate",
		"unlink",
		"utimes",
		"writeFile"
	].filter((key) => {
		return typeof fs[key] === "function";
	});
	Object.keys(fs).forEach((key) => {
		if (key === "promises") return;
		exports[key] = fs[key];
	});
	api.forEach((method) => {
		exports[method] = u(fs[method]);
	});
	exports.exists = function(filename, callback) {
		if (typeof callback === "function") return fs.exists(filename, callback);
		return new Promise((resolve) => {
			return fs.exists(filename, resolve);
		});
	};
	exports.read = function(fd, buffer, offset, length, position, callback) {
		if (typeof callback === "function") return fs.read(fd, buffer, offset, length, position, callback);
		return new Promise((resolve, reject) => {
			fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
				if (err) return reject(err);
				resolve({
					bytesRead,
					buffer
				});
			});
		});
	};
	exports.write = function(fd, buffer, ...args) {
		if (typeof args[args.length - 1] === "function") return fs.write(fd, buffer, ...args);
		return new Promise((resolve, reject) => {
			fs.write(fd, buffer, ...args, (err, bytesWritten, buffer) => {
				if (err) return reject(err);
				resolve({
					bytesWritten,
					buffer
				});
			});
		});
	};
	if (typeof fs.realpath.native === "function") exports.realpath.native = u(fs.realpath.native);
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/mkdirs/win32.js
var require_win32 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var path$25 = require("path");
	function getRootPath(p) {
		p = path$25.normalize(path$25.resolve(p)).split(path$25.sep);
		if (p.length > 0) return p[0];
		return null;
	}
	var INVALID_PATH_CHARS = /[<>:"|?*]/;
	function invalidWin32Path(p) {
		const rp = getRootPath(p);
		p = p.replace(rp, "");
		return INVALID_PATH_CHARS.test(p);
	}
	module.exports = {
		getRootPath,
		invalidWin32Path
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/mkdirs/mkdirs.js
var require_mkdirs$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require_graceful_fs();
	var path$24 = require("path");
	var invalidWin32Path = require_win32().invalidWin32Path;
	var o777 = parseInt("0777", 8);
	function mkdirs(p, opts, callback, made) {
		if (typeof opts === "function") {
			callback = opts;
			opts = {};
		} else if (!opts || typeof opts !== "object") opts = { mode: opts };
		if (process.platform === "win32" && invalidWin32Path(p)) {
			const errInval = /* @__PURE__ */ new Error(p + " contains invalid WIN32 path characters.");
			errInval.code = "EINVAL";
			return callback(errInval);
		}
		let mode = opts.mode;
		const xfs = opts.fs || fs;
		if (mode === void 0) mode = o777 & ~process.umask();
		if (!made) made = null;
		callback = callback || function() {};
		p = path$24.resolve(p);
		xfs.mkdir(p, mode, (er) => {
			if (!er) {
				made = made || p;
				return callback(null, made);
			}
			switch (er.code) {
				case "ENOENT":
					if (path$24.dirname(p) === p) return callback(er);
					mkdirs(path$24.dirname(p), opts, (er, made) => {
						if (er) callback(er, made);
						else mkdirs(p, opts, callback, made);
					});
					break;
				default: xfs.stat(p, (er2, stat) => {
					if (er2 || !stat.isDirectory()) callback(er, made);
					else callback(null, made);
				});
			}
		});
	}
	module.exports = mkdirs;
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/mkdirs/mkdirs-sync.js
var require_mkdirs_sync = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require_graceful_fs();
	var path$23 = require("path");
	var invalidWin32Path = require_win32().invalidWin32Path;
	var o777 = parseInt("0777", 8);
	function mkdirsSync(p, opts, made) {
		if (!opts || typeof opts !== "object") opts = { mode: opts };
		let mode = opts.mode;
		const xfs = opts.fs || fs;
		if (process.platform === "win32" && invalidWin32Path(p)) {
			const errInval = /* @__PURE__ */ new Error(p + " contains invalid WIN32 path characters.");
			errInval.code = "EINVAL";
			throw errInval;
		}
		if (mode === void 0) mode = o777 & ~process.umask();
		if (!made) made = null;
		p = path$23.resolve(p);
		try {
			xfs.mkdirSync(p, mode);
			made = made || p;
		} catch (err0) {
			if (err0.code === "ENOENT") {
				if (path$23.dirname(p) === p) throw err0;
				made = mkdirsSync(path$23.dirname(p), opts, made);
				mkdirsSync(p, opts, made);
			} else {
				let stat;
				try {
					stat = xfs.statSync(p);
				} catch (err1) {
					throw err0;
				}
				if (!stat.isDirectory()) throw err0;
			}
		}
		return made;
	}
	module.exports = mkdirsSync;
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/mkdirs/index.js
var require_mkdirs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromCallback;
	var mkdirs = u(require_mkdirs$1());
	var mkdirsSync = require_mkdirs_sync();
	module.exports = {
		mkdirs,
		mkdirsSync,
		mkdirp: mkdirs,
		mkdirpSync: mkdirsSync,
		ensureDir: mkdirs,
		ensureDirSync: mkdirsSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/util/utimes.js
var require_utimes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require_graceful_fs();
	var os$6 = require("os");
	var path$22 = require("path");
	function hasMillisResSync() {
		let tmpfile = path$22.join("millis-test-sync" + Date.now().toString() + Math.random().toString().slice(2));
		tmpfile = path$22.join(os$6.tmpdir(), tmpfile);
		const d = /* @__PURE__ */ new Date(1435410243862);
		fs.writeFileSync(tmpfile, "https://github.com/jprichardson/node-fs-extra/pull/141");
		const fd = fs.openSync(tmpfile, "r+");
		fs.futimesSync(fd, d, d);
		fs.closeSync(fd);
		return fs.statSync(tmpfile).mtime > 1435410243e3;
	}
	function hasMillisRes(callback) {
		let tmpfile = path$22.join("millis-test" + Date.now().toString() + Math.random().toString().slice(2));
		tmpfile = path$22.join(os$6.tmpdir(), tmpfile);
		const d = /* @__PURE__ */ new Date(1435410243862);
		fs.writeFile(tmpfile, "https://github.com/jprichardson/node-fs-extra/pull/141", (err) => {
			if (err) return callback(err);
			fs.open(tmpfile, "r+", (err, fd) => {
				if (err) return callback(err);
				fs.futimes(fd, d, d, (err) => {
					if (err) return callback(err);
					fs.close(fd, (err) => {
						if (err) return callback(err);
						fs.stat(tmpfile, (err, stats) => {
							if (err) return callback(err);
							callback(null, stats.mtime > 1435410243e3);
						});
					});
				});
			});
		});
	}
	function timeRemoveMillis(timestamp) {
		if (typeof timestamp === "number") return Math.floor(timestamp / 1e3) * 1e3;
		else if (timestamp instanceof Date) return /* @__PURE__ */ new Date(Math.floor(timestamp.getTime() / 1e3) * 1e3);
		else throw new Error("fs-extra: timeRemoveMillis() unknown parameter type");
	}
	function utimesMillis(path, atime, mtime, callback) {
		fs.open(path, "r+", (err, fd) => {
			if (err) return callback(err);
			fs.futimes(fd, atime, mtime, (futimesErr) => {
				fs.close(fd, (closeErr) => {
					if (callback) callback(futimesErr || closeErr);
				});
			});
		});
	}
	function utimesMillisSync(path, atime, mtime) {
		const fd = fs.openSync(path, "r+");
		fs.futimesSync(fd, atime, mtime);
		return fs.closeSync(fd);
	}
	module.exports = {
		hasMillisRes,
		hasMillisResSync,
		timeRemoveMillis,
		utimesMillis,
		utimesMillisSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/util/stat.js
var require_stat = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require_graceful_fs();
	var path$21 = require("path");
	var NODE_VERSION_MAJOR_WITH_BIGINT = 10;
	var NODE_VERSION_MINOR_WITH_BIGINT = 5;
	var NODE_VERSION_PATCH_WITH_BIGINT = 0;
	var nodeVersion = process.versions.node.split(".");
	var nodeVersionMajor = Number.parseInt(nodeVersion[0], 10);
	var nodeVersionMinor = Number.parseInt(nodeVersion[1], 10);
	var nodeVersionPatch = Number.parseInt(nodeVersion[2], 10);
	function nodeSupportsBigInt() {
		if (nodeVersionMajor > NODE_VERSION_MAJOR_WITH_BIGINT) return true;
		else if (nodeVersionMajor === NODE_VERSION_MAJOR_WITH_BIGINT) {
			if (nodeVersionMinor > NODE_VERSION_MINOR_WITH_BIGINT) return true;
			else if (nodeVersionMinor === NODE_VERSION_MINOR_WITH_BIGINT) {
				if (nodeVersionPatch >= NODE_VERSION_PATCH_WITH_BIGINT) return true;
			}
		}
		return false;
	}
	function getStats(src, dest, cb) {
		if (nodeSupportsBigInt()) fs.stat(src, { bigint: true }, (err, srcStat) => {
			if (err) return cb(err);
			fs.stat(dest, { bigint: true }, (err, destStat) => {
				if (err) {
					if (err.code === "ENOENT") return cb(null, {
						srcStat,
						destStat: null
					});
					return cb(err);
				}
				return cb(null, {
					srcStat,
					destStat
				});
			});
		});
		else fs.stat(src, (err, srcStat) => {
			if (err) return cb(err);
			fs.stat(dest, (err, destStat) => {
				if (err) {
					if (err.code === "ENOENT") return cb(null, {
						srcStat,
						destStat: null
					});
					return cb(err);
				}
				return cb(null, {
					srcStat,
					destStat
				});
			});
		});
	}
	function getStatsSync(src, dest) {
		let srcStat, destStat;
		if (nodeSupportsBigInt()) srcStat = fs.statSync(src, { bigint: true });
		else srcStat = fs.statSync(src);
		try {
			if (nodeSupportsBigInt()) destStat = fs.statSync(dest, { bigint: true });
			else destStat = fs.statSync(dest);
		} catch (err) {
			if (err.code === "ENOENT") return {
				srcStat,
				destStat: null
			};
			throw err;
		}
		return {
			srcStat,
			destStat
		};
	}
	function checkPaths(src, dest, funcName, cb) {
		getStats(src, dest, (err, stats) => {
			if (err) return cb(err);
			const { srcStat, destStat } = stats;
			if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) return cb(/* @__PURE__ */ new Error("Source and destination must not be the same."));
			if (srcStat.isDirectory() && isSrcSubdir(src, dest)) return cb(new Error(errMsg(src, dest, funcName)));
			return cb(null, {
				srcStat,
				destStat
			});
		});
	}
	function checkPathsSync(src, dest, funcName) {
		const { srcStat, destStat } = getStatsSync(src, dest);
		if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) throw new Error("Source and destination must not be the same.");
		if (srcStat.isDirectory() && isSrcSubdir(src, dest)) throw new Error(errMsg(src, dest, funcName));
		return {
			srcStat,
			destStat
		};
	}
	function checkParentPaths(src, srcStat, dest, funcName, cb) {
		const srcParent = path$21.resolve(path$21.dirname(src));
		const destParent = path$21.resolve(path$21.dirname(dest));
		if (destParent === srcParent || destParent === path$21.parse(destParent).root) return cb();
		if (nodeSupportsBigInt()) fs.stat(destParent, { bigint: true }, (err, destStat) => {
			if (err) {
				if (err.code === "ENOENT") return cb();
				return cb(err);
			}
			if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) return cb(new Error(errMsg(src, dest, funcName)));
			return checkParentPaths(src, srcStat, destParent, funcName, cb);
		});
		else fs.stat(destParent, (err, destStat) => {
			if (err) {
				if (err.code === "ENOENT") return cb();
				return cb(err);
			}
			if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) return cb(new Error(errMsg(src, dest, funcName)));
			return checkParentPaths(src, srcStat, destParent, funcName, cb);
		});
	}
	function checkParentPathsSync(src, srcStat, dest, funcName) {
		const srcParent = path$21.resolve(path$21.dirname(src));
		const destParent = path$21.resolve(path$21.dirname(dest));
		if (destParent === srcParent || destParent === path$21.parse(destParent).root) return;
		let destStat;
		try {
			if (nodeSupportsBigInt()) destStat = fs.statSync(destParent, { bigint: true });
			else destStat = fs.statSync(destParent);
		} catch (err) {
			if (err.code === "ENOENT") return;
			throw err;
		}
		if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) throw new Error(errMsg(src, dest, funcName));
		return checkParentPathsSync(src, srcStat, destParent, funcName);
	}
	function isSrcSubdir(src, dest) {
		const srcArr = path$21.resolve(src).split(path$21.sep).filter((i) => i);
		const destArr = path$21.resolve(dest).split(path$21.sep).filter((i) => i);
		return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true);
	}
	function errMsg(src, dest, funcName) {
		return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`;
	}
	module.exports = {
		checkPaths,
		checkPathsSync,
		checkParentPaths,
		checkParentPathsSync,
		isSrcSubdir
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/util/buffer.js
var require_buffer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function(size) {
		if (typeof Buffer.allocUnsafe === "function") try {
			return Buffer.allocUnsafe(size);
		} catch (e) {
			return new Buffer(size);
		}
		return new Buffer(size);
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/copy-sync/copy-sync.js
var require_copy_sync$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require_graceful_fs();
	var path$20 = require("path");
	var mkdirpSync = require_mkdirs().mkdirsSync;
	var utimesSync = require_utimes().utimesMillisSync;
	var stat = require_stat();
	function copySync(src, dest, opts) {
		if (typeof opts === "function") opts = { filter: opts };
		opts = opts || {};
		opts.clobber = "clobber" in opts ? !!opts.clobber : true;
		opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
		if (opts.preserveTimestamps && process.arch === "ia32") console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`);
		const { srcStat, destStat } = stat.checkPathsSync(src, dest, "copy");
		stat.checkParentPathsSync(src, srcStat, dest, "copy");
		return handleFilterAndCopy(destStat, src, dest, opts);
	}
	function handleFilterAndCopy(destStat, src, dest, opts) {
		if (opts.filter && !opts.filter(src, dest)) return;
		const destParent = path$20.dirname(dest);
		if (!fs.existsSync(destParent)) mkdirpSync(destParent);
		return startCopy(destStat, src, dest, opts);
	}
	function startCopy(destStat, src, dest, opts) {
		if (opts.filter && !opts.filter(src, dest)) return;
		return getStats(destStat, src, dest, opts);
	}
	function getStats(destStat, src, dest, opts) {
		const srcStat = (opts.dereference ? fs.statSync : fs.lstatSync)(src);
		if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts);
		else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts);
		else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts);
	}
	function onFile(srcStat, destStat, src, dest, opts) {
		if (!destStat) return copyFile(srcStat, src, dest, opts);
		return mayCopyFile(srcStat, src, dest, opts);
	}
	function mayCopyFile(srcStat, src, dest, opts) {
		if (opts.overwrite) {
			fs.unlinkSync(dest);
			return copyFile(srcStat, src, dest, opts);
		} else if (opts.errorOnExist) throw new Error(`'${dest}' already exists`);
	}
	function copyFile(srcStat, src, dest, opts) {
		if (typeof fs.copyFileSync === "function") {
			fs.copyFileSync(src, dest);
			fs.chmodSync(dest, srcStat.mode);
			if (opts.preserveTimestamps) return utimesSync(dest, srcStat.atime, srcStat.mtime);
			return;
		}
		return copyFileFallback(srcStat, src, dest, opts);
	}
	function copyFileFallback(srcStat, src, dest, opts) {
		const BUF_LENGTH = 65536;
		const _buff = require_buffer()(BUF_LENGTH);
		const fdr = fs.openSync(src, "r");
		const fdw = fs.openSync(dest, "w", srcStat.mode);
		let pos = 0;
		while (pos < srcStat.size) {
			const bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
			fs.writeSync(fdw, _buff, 0, bytesRead);
			pos += bytesRead;
		}
		if (opts.preserveTimestamps) fs.futimesSync(fdw, srcStat.atime, srcStat.mtime);
		fs.closeSync(fdr);
		fs.closeSync(fdw);
	}
	function onDir(srcStat, destStat, src, dest, opts) {
		if (!destStat) return mkDirAndCopy(srcStat, src, dest, opts);
		if (destStat && !destStat.isDirectory()) throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
		return copyDir(src, dest, opts);
	}
	function mkDirAndCopy(srcStat, src, dest, opts) {
		fs.mkdirSync(dest);
		copyDir(src, dest, opts);
		return fs.chmodSync(dest, srcStat.mode);
	}
	function copyDir(src, dest, opts) {
		fs.readdirSync(src).forEach((item) => copyDirItem(item, src, dest, opts));
	}
	function copyDirItem(item, src, dest, opts) {
		const srcItem = path$20.join(src, item);
		const destItem = path$20.join(dest, item);
		const { destStat } = stat.checkPathsSync(srcItem, destItem, "copy");
		return startCopy(destStat, srcItem, destItem, opts);
	}
	function onLink(destStat, src, dest, opts) {
		let resolvedSrc = fs.readlinkSync(src);
		if (opts.dereference) resolvedSrc = path$20.resolve(process.cwd(), resolvedSrc);
		if (!destStat) return fs.symlinkSync(resolvedSrc, dest);
		else {
			let resolvedDest;
			try {
				resolvedDest = fs.readlinkSync(dest);
			} catch (err) {
				if (err.code === "EINVAL" || err.code === "UNKNOWN") return fs.symlinkSync(resolvedSrc, dest);
				throw err;
			}
			if (opts.dereference) resolvedDest = path$20.resolve(process.cwd(), resolvedDest);
			if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
			if (fs.statSync(dest).isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
			return copyLink(resolvedSrc, dest);
		}
	}
	function copyLink(resolvedSrc, dest) {
		fs.unlinkSync(dest);
		return fs.symlinkSync(resolvedSrc, dest);
	}
	module.exports = copySync;
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/copy-sync/index.js
var require_copy_sync = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = { copySync: require_copy_sync$1() };
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/path-exists/index.js
var require_path_exists = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromPromise;
	var fs = require_fs();
	function pathExists(path) {
		return fs.access(path).then(() => true).catch(() => false);
	}
	module.exports = {
		pathExists: u(pathExists),
		pathExistsSync: fs.existsSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/copy/copy.js
var require_copy$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require_graceful_fs();
	var path$19 = require("path");
	var mkdirp = require_mkdirs().mkdirs;
	var pathExists = require_path_exists().pathExists;
	var utimes = require_utimes().utimesMillis;
	var stat = require_stat();
	function copy(src, dest, opts, cb) {
		if (typeof opts === "function" && !cb) {
			cb = opts;
			opts = {};
		} else if (typeof opts === "function") opts = { filter: opts };
		cb = cb || function() {};
		opts = opts || {};
		opts.clobber = "clobber" in opts ? !!opts.clobber : true;
		opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
		if (opts.preserveTimestamps && process.arch === "ia32") console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`);
		stat.checkPaths(src, dest, "copy", (err, stats) => {
			if (err) return cb(err);
			const { srcStat, destStat } = stats;
			stat.checkParentPaths(src, srcStat, dest, "copy", (err) => {
				if (err) return cb(err);
				if (opts.filter) return handleFilter(checkParentDir, destStat, src, dest, opts, cb);
				return checkParentDir(destStat, src, dest, opts, cb);
			});
		});
	}
	function checkParentDir(destStat, src, dest, opts, cb) {
		const destParent = path$19.dirname(dest);
		pathExists(destParent, (err, dirExists) => {
			if (err) return cb(err);
			if (dirExists) return startCopy(destStat, src, dest, opts, cb);
			mkdirp(destParent, (err) => {
				if (err) return cb(err);
				return startCopy(destStat, src, dest, opts, cb);
			});
		});
	}
	function handleFilter(onInclude, destStat, src, dest, opts, cb) {
		Promise.resolve(opts.filter(src, dest)).then((include) => {
			if (include) return onInclude(destStat, src, dest, opts, cb);
			return cb();
		}, (error) => cb(error));
	}
	function startCopy(destStat, src, dest, opts, cb) {
		if (opts.filter) return handleFilter(getStats, destStat, src, dest, opts, cb);
		return getStats(destStat, src, dest, opts, cb);
	}
	function getStats(destStat, src, dest, opts, cb) {
		(opts.dereference ? fs.stat : fs.lstat)(src, (err, srcStat) => {
			if (err) return cb(err);
			if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts, cb);
			else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts, cb);
			else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts, cb);
		});
	}
	function onFile(srcStat, destStat, src, dest, opts, cb) {
		if (!destStat) return copyFile(srcStat, src, dest, opts, cb);
		return mayCopyFile(srcStat, src, dest, opts, cb);
	}
	function mayCopyFile(srcStat, src, dest, opts, cb) {
		if (opts.overwrite) fs.unlink(dest, (err) => {
			if (err) return cb(err);
			return copyFile(srcStat, src, dest, opts, cb);
		});
		else if (opts.errorOnExist) return cb(/* @__PURE__ */ new Error(`'${dest}' already exists`));
		else return cb();
	}
	function copyFile(srcStat, src, dest, opts, cb) {
		if (typeof fs.copyFile === "function") return fs.copyFile(src, dest, (err) => {
			if (err) return cb(err);
			return setDestModeAndTimestamps(srcStat, dest, opts, cb);
		});
		return copyFileFallback(srcStat, src, dest, opts, cb);
	}
	function copyFileFallback(srcStat, src, dest, opts, cb) {
		const rs = fs.createReadStream(src);
		rs.on("error", (err) => cb(err)).once("open", () => {
			const ws = fs.createWriteStream(dest, { mode: srcStat.mode });
			ws.on("error", (err) => cb(err)).on("open", () => rs.pipe(ws)).once("close", () => setDestModeAndTimestamps(srcStat, dest, opts, cb));
		});
	}
	function setDestModeAndTimestamps(srcStat, dest, opts, cb) {
		fs.chmod(dest, srcStat.mode, (err) => {
			if (err) return cb(err);
			if (opts.preserveTimestamps) return utimes(dest, srcStat.atime, srcStat.mtime, cb);
			return cb();
		});
	}
	function onDir(srcStat, destStat, src, dest, opts, cb) {
		if (!destStat) return mkDirAndCopy(srcStat, src, dest, opts, cb);
		if (destStat && !destStat.isDirectory()) return cb(/* @__PURE__ */ new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`));
		return copyDir(src, dest, opts, cb);
	}
	function mkDirAndCopy(srcStat, src, dest, opts, cb) {
		fs.mkdir(dest, (err) => {
			if (err) return cb(err);
			copyDir(src, dest, opts, (err) => {
				if (err) return cb(err);
				return fs.chmod(dest, srcStat.mode, cb);
			});
		});
	}
	function copyDir(src, dest, opts, cb) {
		fs.readdir(src, (err, items) => {
			if (err) return cb(err);
			return copyDirItems(items, src, dest, opts, cb);
		});
	}
	function copyDirItems(items, src, dest, opts, cb) {
		const item = items.pop();
		if (!item) return cb();
		return copyDirItem(items, item, src, dest, opts, cb);
	}
	function copyDirItem(items, item, src, dest, opts, cb) {
		const srcItem = path$19.join(src, item);
		const destItem = path$19.join(dest, item);
		stat.checkPaths(srcItem, destItem, "copy", (err, stats) => {
			if (err) return cb(err);
			const { destStat } = stats;
			startCopy(destStat, srcItem, destItem, opts, (err) => {
				if (err) return cb(err);
				return copyDirItems(items, src, dest, opts, cb);
			});
		});
	}
	function onLink(destStat, src, dest, opts, cb) {
		fs.readlink(src, (err, resolvedSrc) => {
			if (err) return cb(err);
			if (opts.dereference) resolvedSrc = path$19.resolve(process.cwd(), resolvedSrc);
			if (!destStat) return fs.symlink(resolvedSrc, dest, cb);
			else fs.readlink(dest, (err, resolvedDest) => {
				if (err) {
					if (err.code === "EINVAL" || err.code === "UNKNOWN") return fs.symlink(resolvedSrc, dest, cb);
					return cb(err);
				}
				if (opts.dereference) resolvedDest = path$19.resolve(process.cwd(), resolvedDest);
				if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) return cb(/* @__PURE__ */ new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`));
				if (destStat.isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) return cb(/* @__PURE__ */ new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`));
				return copyLink(resolvedSrc, dest, cb);
			});
		});
	}
	function copyLink(resolvedSrc, dest, cb) {
		fs.unlink(dest, (err) => {
			if (err) return cb(err);
			return fs.symlink(resolvedSrc, dest, cb);
		});
	}
	module.exports = copy;
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/copy/index.js
var require_copy = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromCallback;
	module.exports = { copy: u(require_copy$1()) };
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/remove/rimraf.js
var require_rimraf = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require_graceful_fs();
	var path$18 = require("path");
	var assert = require("assert");
	var isWindows = process.platform === "win32";
	function defaults(options) {
		[
			"unlink",
			"chmod",
			"stat",
			"lstat",
			"rmdir",
			"readdir"
		].forEach((m) => {
			options[m] = options[m] || fs[m];
			m = m + "Sync";
			options[m] = options[m] || fs[m];
		});
		options.maxBusyTries = options.maxBusyTries || 3;
	}
	function rimraf(p, options, cb) {
		let busyTries = 0;
		if (typeof options === "function") {
			cb = options;
			options = {};
		}
		assert(p, "rimraf: missing path");
		assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
		assert.strictEqual(typeof cb, "function", "rimraf: callback function required");
		assert(options, "rimraf: invalid options argument provided");
		assert.strictEqual(typeof options, "object", "rimraf: options should be object");
		defaults(options);
		rimraf_(p, options, function CB(er) {
			if (er) {
				if ((er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") && busyTries < options.maxBusyTries) {
					busyTries++;
					const time = busyTries * 100;
					return setTimeout(() => rimraf_(p, options, CB), time);
				}
				if (er.code === "ENOENT") er = null;
			}
			cb(er);
		});
	}
	function rimraf_(p, options, cb) {
		assert(p);
		assert(options);
		assert(typeof cb === "function");
		options.lstat(p, (er, st) => {
			if (er && er.code === "ENOENT") return cb(null);
			if (er && er.code === "EPERM" && isWindows) return fixWinEPERM(p, options, er, cb);
			if (st && st.isDirectory()) return rmdir(p, options, er, cb);
			options.unlink(p, (er) => {
				if (er) {
					if (er.code === "ENOENT") return cb(null);
					if (er.code === "EPERM") return isWindows ? fixWinEPERM(p, options, er, cb) : rmdir(p, options, er, cb);
					if (er.code === "EISDIR") return rmdir(p, options, er, cb);
				}
				return cb(er);
			});
		});
	}
	function fixWinEPERM(p, options, er, cb) {
		assert(p);
		assert(options);
		assert(typeof cb === "function");
		if (er) assert(er instanceof Error);
		options.chmod(p, 438, (er2) => {
			if (er2) cb(er2.code === "ENOENT" ? null : er);
			else options.stat(p, (er3, stats) => {
				if (er3) cb(er3.code === "ENOENT" ? null : er);
				else if (stats.isDirectory()) rmdir(p, options, er, cb);
				else options.unlink(p, cb);
			});
		});
	}
	function fixWinEPERMSync(p, options, er) {
		let stats;
		assert(p);
		assert(options);
		if (er) assert(er instanceof Error);
		try {
			options.chmodSync(p, 438);
		} catch (er2) {
			if (er2.code === "ENOENT") return;
			else throw er;
		}
		try {
			stats = options.statSync(p);
		} catch (er3) {
			if (er3.code === "ENOENT") return;
			else throw er;
		}
		if (stats.isDirectory()) rmdirSync(p, options, er);
		else options.unlinkSync(p);
	}
	function rmdir(p, options, originalEr, cb) {
		assert(p);
		assert(options);
		if (originalEr) assert(originalEr instanceof Error);
		assert(typeof cb === "function");
		options.rmdir(p, (er) => {
			if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")) rmkids(p, options, cb);
			else if (er && er.code === "ENOTDIR") cb(originalEr);
			else cb(er);
		});
	}
	function rmkids(p, options, cb) {
		assert(p);
		assert(options);
		assert(typeof cb === "function");
		options.readdir(p, (er, files) => {
			if (er) return cb(er);
			let n = files.length;
			let errState;
			if (n === 0) return options.rmdir(p, cb);
			files.forEach((f) => {
				rimraf(path$18.join(p, f), options, (er) => {
					if (errState) return;
					if (er) return cb(errState = er);
					if (--n === 0) options.rmdir(p, cb);
				});
			});
		});
	}
	function rimrafSync(p, options) {
		let st;
		options = options || {};
		defaults(options);
		assert(p, "rimraf: missing path");
		assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
		assert(options, "rimraf: missing options");
		assert.strictEqual(typeof options, "object", "rimraf: options should be object");
		try {
			st = options.lstatSync(p);
		} catch (er) {
			if (er.code === "ENOENT") return;
			if (er.code === "EPERM" && isWindows) fixWinEPERMSync(p, options, er);
		}
		try {
			if (st && st.isDirectory()) rmdirSync(p, options, null);
			else options.unlinkSync(p);
		} catch (er) {
			if (er.code === "ENOENT") return;
			else if (er.code === "EPERM") return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er);
			else if (er.code !== "EISDIR") throw er;
			rmdirSync(p, options, er);
		}
	}
	function rmdirSync(p, options, originalEr) {
		assert(p);
		assert(options);
		if (originalEr) assert(originalEr instanceof Error);
		try {
			options.rmdirSync(p);
		} catch (er) {
			if (er.code === "ENOTDIR") throw originalEr;
			else if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM") rmkidsSync(p, options);
			else if (er.code !== "ENOENT") throw er;
		}
	}
	function rmkidsSync(p, options) {
		assert(p);
		assert(options);
		options.readdirSync(p).forEach((f) => rimrafSync(path$18.join(p, f), options));
		if (isWindows) {
			const startTime = Date.now();
			do
				try {
					return options.rmdirSync(p, options);
				} catch (er) {}
			while (Date.now() - startTime < 500);
		} else return options.rmdirSync(p, options);
	}
	module.exports = rimraf;
	rimraf.sync = rimrafSync;
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/remove/index.js
var require_remove = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromCallback;
	var rimraf = require_rimraf();
	module.exports = {
		remove: u(rimraf),
		removeSync: rimraf.sync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/empty/index.js
var require_empty = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromCallback;
	var fs = require_graceful_fs();
	var path$17 = require("path");
	var mkdir = require_mkdirs();
	var remove = require_remove();
	var emptyDir = u(function emptyDir(dir, callback) {
		callback = callback || function() {};
		fs.readdir(dir, (err, items) => {
			if (err) return mkdir.mkdirs(dir, callback);
			items = items.map((item) => path$17.join(dir, item));
			deleteItem();
			function deleteItem() {
				const item = items.pop();
				if (!item) return callback();
				remove.remove(item, (err) => {
					if (err) return callback(err);
					deleteItem();
				});
			}
		});
	});
	function emptyDirSync(dir) {
		let items;
		try {
			items = fs.readdirSync(dir);
		} catch (err) {
			return mkdir.mkdirsSync(dir);
		}
		items.forEach((item) => {
			item = path$17.join(dir, item);
			remove.removeSync(item);
		});
	}
	module.exports = {
		emptyDirSync,
		emptydirSync: emptyDirSync,
		emptyDir,
		emptydir: emptyDir
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/ensure/file.js
var require_file$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromCallback;
	var path$16 = require("path");
	var fs = require_graceful_fs();
	var mkdir = require_mkdirs();
	var pathExists = require_path_exists().pathExists;
	function createFile(file, callback) {
		function makeFile() {
			fs.writeFile(file, "", (err) => {
				if (err) return callback(err);
				callback();
			});
		}
		fs.stat(file, (err, stats) => {
			if (!err && stats.isFile()) return callback();
			const dir = path$16.dirname(file);
			pathExists(dir, (err, dirExists) => {
				if (err) return callback(err);
				if (dirExists) return makeFile();
				mkdir.mkdirs(dir, (err) => {
					if (err) return callback(err);
					makeFile();
				});
			});
		});
	}
	function createFileSync(file) {
		let stats;
		try {
			stats = fs.statSync(file);
		} catch (e) {}
		if (stats && stats.isFile()) return;
		const dir = path$16.dirname(file);
		if (!fs.existsSync(dir)) mkdir.mkdirsSync(dir);
		fs.writeFileSync(file, "");
	}
	module.exports = {
		createFile: u(createFile),
		createFileSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/ensure/link.js
var require_link = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromCallback;
	var path$15 = require("path");
	var fs = require_graceful_fs();
	var mkdir = require_mkdirs();
	var pathExists = require_path_exists().pathExists;
	function createLink(srcpath, dstpath, callback) {
		function makeLink(srcpath, dstpath) {
			fs.link(srcpath, dstpath, (err) => {
				if (err) return callback(err);
				callback(null);
			});
		}
		pathExists(dstpath, (err, destinationExists) => {
			if (err) return callback(err);
			if (destinationExists) return callback(null);
			fs.lstat(srcpath, (err) => {
				if (err) {
					err.message = err.message.replace("lstat", "ensureLink");
					return callback(err);
				}
				const dir = path$15.dirname(dstpath);
				pathExists(dir, (err, dirExists) => {
					if (err) return callback(err);
					if (dirExists) return makeLink(srcpath, dstpath);
					mkdir.mkdirs(dir, (err) => {
						if (err) return callback(err);
						makeLink(srcpath, dstpath);
					});
				});
			});
		});
	}
	function createLinkSync(srcpath, dstpath) {
		if (fs.existsSync(dstpath)) return void 0;
		try {
			fs.lstatSync(srcpath);
		} catch (err) {
			err.message = err.message.replace("lstat", "ensureLink");
			throw err;
		}
		const dir = path$15.dirname(dstpath);
		if (fs.existsSync(dir)) return fs.linkSync(srcpath, dstpath);
		mkdir.mkdirsSync(dir);
		return fs.linkSync(srcpath, dstpath);
	}
	module.exports = {
		createLink: u(createLink),
		createLinkSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/ensure/symlink-paths.js
var require_symlink_paths = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var path$14 = require("path");
	var fs = require_graceful_fs();
	var pathExists = require_path_exists().pathExists;
	/**
	* Function that returns two types of paths, one relative to symlink, and one
	* relative to the current working directory. Checks if path is absolute or
	* relative. If the path is relative, this function checks if the path is
	* relative to symlink or relative to current working directory. This is an
	* initiative to find a smarter `srcpath` to supply when building symlinks.
	* This allows you to determine which path to use out of one of three possible
	* types of source paths. The first is an absolute path. This is detected by
	* `path.isAbsolute()`. When an absolute path is provided, it is checked to
	* see if it exists. If it does it's used, if not an error is returned
	* (callback)/ thrown (sync). The other two options for `srcpath` are a
	* relative url. By default Node's `fs.symlink` works by creating a symlink
	* using `dstpath` and expects the `srcpath` to be relative to the newly
	* created symlink. If you provide a `srcpath` that does not exist on the file
	* system it results in a broken symlink. To minimize this, the function
	* checks to see if the 'relative to symlink' source file exists, and if it
	* does it will use it. If it does not, it checks if there's a file that
	* exists that is relative to the current working directory, if does its used.
	* This preserves the expectations of the original fs.symlink spec and adds
	* the ability to pass in `relative to current working direcotry` paths.
	*/
	function symlinkPaths(srcpath, dstpath, callback) {
		if (path$14.isAbsolute(srcpath)) return fs.lstat(srcpath, (err) => {
			if (err) {
				err.message = err.message.replace("lstat", "ensureSymlink");
				return callback(err);
			}
			return callback(null, {
				"toCwd": srcpath,
				"toDst": srcpath
			});
		});
		else {
			const dstdir = path$14.dirname(dstpath);
			const relativeToDst = path$14.join(dstdir, srcpath);
			return pathExists(relativeToDst, (err, exists) => {
				if (err) return callback(err);
				if (exists) return callback(null, {
					"toCwd": relativeToDst,
					"toDst": srcpath
				});
				else return fs.lstat(srcpath, (err) => {
					if (err) {
						err.message = err.message.replace("lstat", "ensureSymlink");
						return callback(err);
					}
					return callback(null, {
						"toCwd": srcpath,
						"toDst": path$14.relative(dstdir, srcpath)
					});
				});
			});
		}
	}
	function symlinkPathsSync(srcpath, dstpath) {
		let exists;
		if (path$14.isAbsolute(srcpath)) {
			exists = fs.existsSync(srcpath);
			if (!exists) throw new Error("absolute srcpath does not exist");
			return {
				"toCwd": srcpath,
				"toDst": srcpath
			};
		} else {
			const dstdir = path$14.dirname(dstpath);
			const relativeToDst = path$14.join(dstdir, srcpath);
			exists = fs.existsSync(relativeToDst);
			if (exists) return {
				"toCwd": relativeToDst,
				"toDst": srcpath
			};
			else {
				exists = fs.existsSync(srcpath);
				if (!exists) throw new Error("relative srcpath does not exist");
				return {
					"toCwd": srcpath,
					"toDst": path$14.relative(dstdir, srcpath)
				};
			}
		}
	}
	module.exports = {
		symlinkPaths,
		symlinkPathsSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/ensure/symlink-type.js
var require_symlink_type = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require_graceful_fs();
	function symlinkType(srcpath, type, callback) {
		callback = typeof type === "function" ? type : callback;
		type = typeof type === "function" ? false : type;
		if (type) return callback(null, type);
		fs.lstat(srcpath, (err, stats) => {
			if (err) return callback(null, "file");
			type = stats && stats.isDirectory() ? "dir" : "file";
			callback(null, type);
		});
	}
	function symlinkTypeSync(srcpath, type) {
		let stats;
		if (type) return type;
		try {
			stats = fs.lstatSync(srcpath);
		} catch (e) {
			return "file";
		}
		return stats && stats.isDirectory() ? "dir" : "file";
	}
	module.exports = {
		symlinkType,
		symlinkTypeSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/ensure/symlink.js
var require_symlink = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromCallback;
	var path$13 = require("path");
	var fs = require_graceful_fs();
	var _mkdirs = require_mkdirs();
	var mkdirs = _mkdirs.mkdirs;
	var mkdirsSync = _mkdirs.mkdirsSync;
	var _symlinkPaths = require_symlink_paths();
	var symlinkPaths = _symlinkPaths.symlinkPaths;
	var symlinkPathsSync = _symlinkPaths.symlinkPathsSync;
	var _symlinkType = require_symlink_type();
	var symlinkType = _symlinkType.symlinkType;
	var symlinkTypeSync = _symlinkType.symlinkTypeSync;
	var pathExists = require_path_exists().pathExists;
	function createSymlink(srcpath, dstpath, type, callback) {
		callback = typeof type === "function" ? type : callback;
		type = typeof type === "function" ? false : type;
		pathExists(dstpath, (err, destinationExists) => {
			if (err) return callback(err);
			if (destinationExists) return callback(null);
			symlinkPaths(srcpath, dstpath, (err, relative) => {
				if (err) return callback(err);
				srcpath = relative.toDst;
				symlinkType(relative.toCwd, type, (err, type) => {
					if (err) return callback(err);
					const dir = path$13.dirname(dstpath);
					pathExists(dir, (err, dirExists) => {
						if (err) return callback(err);
						if (dirExists) return fs.symlink(srcpath, dstpath, type, callback);
						mkdirs(dir, (err) => {
							if (err) return callback(err);
							fs.symlink(srcpath, dstpath, type, callback);
						});
					});
				});
			});
		});
	}
	function createSymlinkSync(srcpath, dstpath, type) {
		if (fs.existsSync(dstpath)) return void 0;
		const relative = symlinkPathsSync(srcpath, dstpath);
		srcpath = relative.toDst;
		type = symlinkTypeSync(relative.toCwd, type);
		const dir = path$13.dirname(dstpath);
		if (fs.existsSync(dir)) return fs.symlinkSync(srcpath, dstpath, type);
		mkdirsSync(dir);
		return fs.symlinkSync(srcpath, dstpath, type);
	}
	module.exports = {
		createSymlink: u(createSymlink),
		createSymlinkSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/ensure/index.js
var require_ensure = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var file = require_file$1();
	var link = require_link();
	var symlink = require_symlink();
	module.exports = {
		createFile: file.createFile,
		createFileSync: file.createFileSync,
		ensureFile: file.createFile,
		ensureFileSync: file.createFileSync,
		createLink: link.createLink,
		createLinkSync: link.createLinkSync,
		ensureLink: link.createLink,
		ensureLinkSync: link.createLinkSync,
		createSymlink: symlink.createSymlink,
		createSymlinkSync: symlink.createSymlinkSync,
		ensureSymlink: symlink.createSymlink,
		ensureSymlinkSync: symlink.createSymlinkSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/jsonfile/index.js
var require_jsonfile$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _fs;
	try {
		_fs = require_graceful_fs();
	} catch (_) {
		_fs = require("fs");
	}
	function readFile(file, options, callback) {
		if (callback == null) {
			callback = options;
			options = {};
		}
		if (typeof options === "string") options = { encoding: options };
		options = options || {};
		var fs = options.fs || _fs;
		var shouldThrow = true;
		if ("throws" in options) shouldThrow = options.throws;
		fs.readFile(file, options, function(err, data) {
			if (err) return callback(err);
			data = stripBom(data);
			var obj;
			try {
				obj = JSON.parse(data, options ? options.reviver : null);
			} catch (err2) {
				if (shouldThrow) {
					err2.message = file + ": " + err2.message;
					return callback(err2);
				} else return callback(null, null);
			}
			callback(null, obj);
		});
	}
	function readFileSync(file, options) {
		options = options || {};
		if (typeof options === "string") options = { encoding: options };
		var fs = options.fs || _fs;
		var shouldThrow = true;
		if ("throws" in options) shouldThrow = options.throws;
		try {
			var content = fs.readFileSync(file, options);
			content = stripBom(content);
			return JSON.parse(content, options.reviver);
		} catch (err) {
			if (shouldThrow) {
				err.message = file + ": " + err.message;
				throw err;
			} else return null;
		}
	}
	function stringify(obj, options) {
		var spaces;
		var EOL = "\n";
		if (typeof options === "object" && options !== null) {
			if (options.spaces) spaces = options.spaces;
			if (options.EOL) EOL = options.EOL;
		}
		return JSON.stringify(obj, options ? options.replacer : null, spaces).replace(/\n/g, EOL) + EOL;
	}
	function writeFile(file, obj, options, callback) {
		if (callback == null) {
			callback = options;
			options = {};
		}
		options = options || {};
		var fs = options.fs || _fs;
		var str = "";
		try {
			str = stringify(obj, options);
		} catch (err) {
			if (callback) callback(err, null);
			return;
		}
		fs.writeFile(file, str, options, callback);
	}
	function writeFileSync(file, obj, options) {
		options = options || {};
		var fs = options.fs || _fs;
		var str = stringify(obj, options);
		return fs.writeFileSync(file, str, options);
	}
	function stripBom(content) {
		if (Buffer.isBuffer(content)) content = content.toString("utf8");
		content = content.replace(/^\uFEFF/, "");
		return content;
	}
	module.exports = {
		readFile,
		readFileSync,
		writeFile,
		writeFileSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/json/jsonfile.js
var require_jsonfile = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromCallback;
	var jsonFile = require_jsonfile$1();
	module.exports = {
		readJson: u(jsonFile.readFile),
		readJsonSync: jsonFile.readFileSync,
		writeJson: u(jsonFile.writeFile),
		writeJsonSync: jsonFile.writeFileSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/json/output-json.js
var require_output_json = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var path$12 = require("path");
	var mkdir = require_mkdirs();
	var pathExists = require_path_exists().pathExists;
	var jsonFile = require_jsonfile();
	function outputJson(file, data, options, callback) {
		if (typeof options === "function") {
			callback = options;
			options = {};
		}
		const dir = path$12.dirname(file);
		pathExists(dir, (err, itDoes) => {
			if (err) return callback(err);
			if (itDoes) return jsonFile.writeJson(file, data, options, callback);
			mkdir.mkdirs(dir, (err) => {
				if (err) return callback(err);
				jsonFile.writeJson(file, data, options, callback);
			});
		});
	}
	module.exports = outputJson;
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/json/output-json-sync.js
var require_output_json_sync = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require_graceful_fs();
	var path$11 = require("path");
	var mkdir = require_mkdirs();
	var jsonFile = require_jsonfile();
	function outputJsonSync(file, data, options) {
		const dir = path$11.dirname(file);
		if (!fs.existsSync(dir)) mkdir.mkdirsSync(dir);
		jsonFile.writeJsonSync(file, data, options);
	}
	module.exports = outputJsonSync;
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/json/index.js
var require_json = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromCallback;
	var jsonFile = require_jsonfile();
	jsonFile.outputJson = u(require_output_json());
	jsonFile.outputJsonSync = require_output_json_sync();
	jsonFile.outputJSON = jsonFile.outputJson;
	jsonFile.outputJSONSync = jsonFile.outputJsonSync;
	jsonFile.writeJSON = jsonFile.writeJson;
	jsonFile.writeJSONSync = jsonFile.writeJsonSync;
	jsonFile.readJSON = jsonFile.readJson;
	jsonFile.readJSONSync = jsonFile.readJsonSync;
	module.exports = jsonFile;
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/move-sync/move-sync.js
var require_move_sync$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require_graceful_fs();
	var path$10 = require("path");
	var copySync = require_copy_sync().copySync;
	var removeSync = require_remove().removeSync;
	var mkdirpSync = require_mkdirs().mkdirpSync;
	var stat = require_stat();
	function moveSync(src, dest, opts) {
		opts = opts || {};
		const overwrite = opts.overwrite || opts.clobber || false;
		const { srcStat } = stat.checkPathsSync(src, dest, "move");
		stat.checkParentPathsSync(src, srcStat, dest, "move");
		mkdirpSync(path$10.dirname(dest));
		return doRename(src, dest, overwrite);
	}
	function doRename(src, dest, overwrite) {
		if (overwrite) {
			removeSync(dest);
			return rename(src, dest, overwrite);
		}
		if (fs.existsSync(dest)) throw new Error("dest already exists.");
		return rename(src, dest, overwrite);
	}
	function rename(src, dest, overwrite) {
		try {
			fs.renameSync(src, dest);
		} catch (err) {
			if (err.code !== "EXDEV") throw err;
			return moveAcrossDevice(src, dest, overwrite);
		}
	}
	function moveAcrossDevice(src, dest, overwrite) {
		copySync(src, dest, {
			overwrite,
			errorOnExist: true
		});
		return removeSync(src);
	}
	module.exports = moveSync;
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/move-sync/index.js
var require_move_sync = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = { moveSync: require_move_sync$1() };
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/move/move.js
var require_move$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require_graceful_fs();
	var path$9 = require("path");
	var copy = require_copy().copy;
	var remove = require_remove().remove;
	var mkdirp = require_mkdirs().mkdirp;
	var pathExists = require_path_exists().pathExists;
	var stat = require_stat();
	function move(src, dest, opts, cb) {
		if (typeof opts === "function") {
			cb = opts;
			opts = {};
		}
		const overwrite = opts.overwrite || opts.clobber || false;
		stat.checkPaths(src, dest, "move", (err, stats) => {
			if (err) return cb(err);
			const { srcStat } = stats;
			stat.checkParentPaths(src, srcStat, dest, "move", (err) => {
				if (err) return cb(err);
				mkdirp(path$9.dirname(dest), (err) => {
					if (err) return cb(err);
					return doRename(src, dest, overwrite, cb);
				});
			});
		});
	}
	function doRename(src, dest, overwrite, cb) {
		if (overwrite) return remove(dest, (err) => {
			if (err) return cb(err);
			return rename(src, dest, overwrite, cb);
		});
		pathExists(dest, (err, destExists) => {
			if (err) return cb(err);
			if (destExists) return cb(/* @__PURE__ */ new Error("dest already exists."));
			return rename(src, dest, overwrite, cb);
		});
	}
	function rename(src, dest, overwrite, cb) {
		fs.rename(src, dest, (err) => {
			if (!err) return cb();
			if (err.code !== "EXDEV") return cb(err);
			return moveAcrossDevice(src, dest, overwrite, cb);
		});
	}
	function moveAcrossDevice(src, dest, overwrite, cb) {
		copy(src, dest, {
			overwrite,
			errorOnExist: true
		}, (err) => {
			if (err) return cb(err);
			return remove(src, cb);
		});
	}
	module.exports = move;
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/move/index.js
var require_move = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromCallback;
	module.exports = { move: u(require_move$1()) };
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/output/index.js
var require_output = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var u = require_universalify().fromCallback;
	var fs = require_graceful_fs();
	var path$8 = require("path");
	var mkdir = require_mkdirs();
	var pathExists = require_path_exists().pathExists;
	function outputFile(file, data, encoding, callback) {
		if (typeof encoding === "function") {
			callback = encoding;
			encoding = "utf8";
		}
		const dir = path$8.dirname(file);
		pathExists(dir, (err, itDoes) => {
			if (err) return callback(err);
			if (itDoes) return fs.writeFile(file, data, encoding, callback);
			mkdir.mkdirs(dir, (err) => {
				if (err) return callback(err);
				fs.writeFile(file, data, encoding, callback);
			});
		});
	}
	function outputFileSync(file, ...args) {
		const dir = path$8.dirname(file);
		if (fs.existsSync(dir)) return fs.writeFileSync(file, ...args);
		mkdir.mkdirsSync(dir);
		fs.writeFileSync(file, ...args);
	}
	module.exports = {
		outputFile: u(outputFile),
		outputFileSync
	};
}));
//#endregion
//#region ../node_modules/streamroller/node_modules/fs-extra/lib/index.js
var require_lib$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = Object.assign({}, require_fs(), require_copy_sync(), require_copy(), require_empty(), require_ensure(), require_json(), require_mkdirs(), require_move_sync(), require_move(), require_output(), require_path_exists(), require_remove());
	var fs$4 = require("fs");
	if (Object.getOwnPropertyDescriptor(fs$4, "promises")) Object.defineProperty(module.exports, "promises", { get() {
		return fs$4.promises;
	} });
}));
//#endregion
//#region ../node_modules/streamroller/lib/now.js
var require_now = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = () => /* @__PURE__ */ new Date();
}));
//#endregion
//#region ../node_modules/streamroller/lib/fileNameFormatter.js
var require_fileNameFormatter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("streamroller:fileNameFormatter");
	var path$7 = require("path");
	var ZIP_EXT = ".gz";
	var DEFAULT_FILENAME_SEP = ".";
	module.exports = ({ file, keepFileExt, needsIndex, alwaysIncludeDate, compress, fileNameSep }) => {
		let FILENAME_SEP = fileNameSep || DEFAULT_FILENAME_SEP;
		const dirAndName = path$7.join(file.dir, file.name);
		const ext = (f) => f + file.ext;
		const index = (f, i, d) => (needsIndex || !d) && i ? f + FILENAME_SEP + i : f;
		const date = (f, i, d) => {
			return (i > 0 || alwaysIncludeDate) && d ? f + FILENAME_SEP + d : f;
		};
		const gzip = (f, i) => i && compress ? f + ZIP_EXT : f;
		const parts = keepFileExt ? [
			date,
			index,
			ext,
			gzip
		] : [
			ext,
			date,
			index,
			gzip
		];
		return ({ date, index }) => {
			debug(`_formatFileName: date=${date}, index=${index}`);
			return parts.reduce((filename, part) => part(filename, index, date), dirAndName);
		};
	};
}));
//#endregion
//#region ../node_modules/streamroller/lib/fileNameParser.js
var require_fileNameParser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("streamroller:fileNameParser");
	var ZIP_EXT = ".gz";
	var format = require_lib$3();
	var DEFAULT_FILENAME_SEP = ".";
	module.exports = ({ file, keepFileExt, pattern, fileNameSep }) => {
		let FILENAME_SEP = fileNameSep || DEFAULT_FILENAME_SEP;
		const zip = (f, p) => {
			if (f.endsWith(ZIP_EXT)) {
				debug("it is gzipped");
				p.isCompressed = true;
				return f.slice(0, -3);
			}
			return f;
		};
		const __NOT_MATCHING__ = "__NOT_MATCHING__";
		const extAtEnd = (f) => {
			if (f.startsWith(file.name) && f.endsWith(file.ext)) {
				debug("it starts and ends with the right things");
				return f.slice(file.name.length + 1, -1 * file.ext.length);
			}
			return __NOT_MATCHING__;
		};
		const extInMiddle = (f) => {
			if (f.startsWith(file.base)) {
				debug("it starts with the right things");
				return f.slice(file.base.length + 1);
			}
			return __NOT_MATCHING__;
		};
		const dateAndIndex = (f, p) => {
			const items = f.split(FILENAME_SEP);
			let indexStr = items[items.length - 1];
			debug("items: ", items, ", indexStr: ", indexStr);
			let dateStr = f;
			if (indexStr !== void 0 && indexStr.match(/^\d+$/)) {
				dateStr = f.slice(0, -1 * (indexStr.length + 1));
				debug(`dateStr is ${dateStr}`);
				if (pattern && !dateStr) {
					dateStr = indexStr;
					indexStr = "0";
				}
			} else indexStr = "0";
			try {
				const date = format.parse(pattern, dateStr, new Date(0, 0));
				if (format.asString(pattern, date) !== dateStr) return f;
				p.index = parseInt(indexStr, 10);
				p.date = dateStr;
				p.timestamp = date.getTime();
				return "";
			} catch (e) {
				debug(`Problem parsing ${dateStr} as ${pattern}, error was: `, e);
				return f;
			}
		};
		const index = (f, p) => {
			if (f.match(/^\d+$/)) {
				debug("it has an index");
				p.index = parseInt(f, 10);
				return "";
			}
			return f;
		};
		let parts = [
			zip,
			keepFileExt ? extAtEnd : extInMiddle,
			pattern ? dateAndIndex : index
		];
		return (filename) => {
			let result = {
				filename,
				index: 0,
				isCompressed: false
			};
			return parts.reduce((remains, part) => part(remains, result), filename) ? null : result;
		};
	};
}));
//#endregion
//#region ../node_modules/streamroller/lib/moveAndMaybeCompressFile.js
var require_moveAndMaybeCompressFile = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("streamroller:moveAndMaybeCompressFile");
	var fs = require_lib$2();
	var zlib$1 = require("zlib");
	var _parseOption = function(rawOptions) {
		const options = Object.assign({}, {
			mode: parseInt("0600", 8),
			compress: false
		}, rawOptions);
		debug(`_parseOption: moveAndMaybeCompressFile called with option=${JSON.stringify(options)}`);
		return options;
	};
	var moveAndMaybeCompressFile = async (sourceFilePath, targetFilePath, options) => {
		options = _parseOption(options);
		if (sourceFilePath === targetFilePath) {
			debug(`moveAndMaybeCompressFile: source and target are the same, not doing anything`);
			return;
		}
		if (await fs.pathExists(sourceFilePath)) {
			debug(`moveAndMaybeCompressFile: moving file from ${sourceFilePath} to ${targetFilePath} ${options.compress ? "with" : "without"} compress`);
			if (options.compress) await new Promise((resolve, reject) => {
				let isCreated = false;
				const writeStream = fs.createWriteStream(targetFilePath, {
					mode: options.mode,
					flags: "wx"
				}).on("open", () => {
					isCreated = true;
					const readStream = fs.createReadStream(sourceFilePath).on("open", () => {
						readStream.pipe(zlib$1.createGzip()).pipe(writeStream);
					}).on("error", (e) => {
						debug(`moveAndMaybeCompressFile: error reading ${sourceFilePath}`, e);
						writeStream.destroy(e);
					});
				}).on("finish", () => {
					debug(`moveAndMaybeCompressFile: finished compressing ${targetFilePath}, deleting ${sourceFilePath}`);
					fs.unlink(sourceFilePath).then(resolve).catch((e) => {
						debug(`moveAndMaybeCompressFile: error deleting ${sourceFilePath}, truncating instead`, e);
						fs.truncate(sourceFilePath).then(resolve).catch((e) => {
							debug(`moveAndMaybeCompressFile: error truncating ${sourceFilePath}`, e);
							reject(e);
						});
					});
				}).on("error", (e) => {
					if (!isCreated) {
						debug(`moveAndMaybeCompressFile: error creating ${targetFilePath}`, e);
						reject(e);
					} else {
						debug(`moveAndMaybeCompressFile: error writing ${targetFilePath}, deleting`, e);
						fs.unlink(targetFilePath).then(() => {
							reject(e);
						}).catch((e) => {
							debug(`moveAndMaybeCompressFile: error deleting ${targetFilePath}`, e);
							reject(e);
						});
					}
				});
			}).catch(() => {});
			else {
				debug(`moveAndMaybeCompressFile: renaming ${sourceFilePath} to ${targetFilePath}`);
				try {
					await fs.move(sourceFilePath, targetFilePath, { overwrite: true });
				} catch (e) {
					debug(`moveAndMaybeCompressFile: error renaming ${sourceFilePath} to ${targetFilePath}`, e);
					/* istanbul ignore else: no need to do anything if file does not exist */
					if (e.code !== "ENOENT") {
						debug(`moveAndMaybeCompressFile: trying copy+truncate instead`);
						try {
							await fs.copy(sourceFilePath, targetFilePath, { overwrite: true });
							await fs.truncate(sourceFilePath);
						} catch (e) {
							debug(`moveAndMaybeCompressFile: error copy+truncate`, e);
						}
					}
				}
			}
		}
	};
	module.exports = moveAndMaybeCompressFile;
}));
//#endregion
//#region ../node_modules/streamroller/lib/RollingFileWriteStream.js
var require_RollingFileWriteStream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("streamroller:RollingFileWriteStream");
	var fs = require_lib$2();
	var path$6 = require("path");
	var os$5 = require("os");
	var newNow = require_now();
	var format = require_lib$3();
	var { Writable: Writable$1 } = require("stream");
	var fileNameFormatter = require_fileNameFormatter();
	var fileNameParser = require_fileNameParser();
	var moveAndMaybeCompressFile = require_moveAndMaybeCompressFile();
	var deleteFiles = (fileNames) => {
		debug(`deleteFiles: files to delete: ${fileNames}`);
		return Promise.all(fileNames.map((f) => fs.unlink(f).catch((e) => {
			debug(`deleteFiles: error when unlinking ${f}, ignoring. Error was ${e}`);
		})));
	};
	/**
	* RollingFileWriteStream is mainly used when writing to a file rolling by date or size.
	* RollingFileWriteStream inherits from stream.Writable
	*/
	var RollingFileWriteStream = class extends Writable$1 {
		/**
		* Create a RollingFileWriteStream
		* @constructor
		* @param {string} filePath - The file path to write.
		* @param {object} options - The extra options
		* @param {number} options.numToKeep - The max numbers of files to keep.
		* @param {number} options.maxSize - The maxSize one file can reach. Unit is Byte.
		*                                   This should be more than 1024. The default is 0.
		*                                   If not specified or 0, then no log rolling will happen.
		* @param {string} options.mode - The mode of the files. The default is '0600'. Refer to stream.writable for more.
		* @param {string} options.flags - The default is 'a'. Refer to stream.flags for more.
		* @param {boolean} options.compress - Whether to compress backup files.
		* @param {boolean} options.keepFileExt - Whether to keep the file extension.
		* @param {string} options.pattern - The date string pattern in the file name.
		* @param {boolean} options.alwaysIncludePattern - Whether to add date to the name of the first file.
		*/
		constructor(filePath, options) {
			debug(`constructor: creating RollingFileWriteStream. path=${filePath}`);
			if (typeof filePath !== "string" || filePath.length === 0) throw new Error(`Invalid filename: ${filePath}`);
			else if (filePath.endsWith(path$6.sep)) throw new Error(`Filename is a directory: ${filePath}`);
			else if (filePath.indexOf(`~${path$6.sep}`) === 0) filePath = filePath.replace("~", os$5.homedir());
			super(options);
			this.options = this._parseOption(options);
			this.fileObject = path$6.parse(filePath);
			if (this.fileObject.dir === "") this.fileObject = path$6.parse(path$6.join(process.cwd(), filePath));
			this.fileFormatter = fileNameFormatter({
				file: this.fileObject,
				alwaysIncludeDate: this.options.alwaysIncludePattern,
				needsIndex: this.options.maxSize < Number.MAX_SAFE_INTEGER,
				compress: this.options.compress,
				keepFileExt: this.options.keepFileExt,
				fileNameSep: this.options.fileNameSep
			});
			this.fileNameParser = fileNameParser({
				file: this.fileObject,
				keepFileExt: this.options.keepFileExt,
				pattern: this.options.pattern,
				fileNameSep: this.options.fileNameSep
			});
			this.state = { currentSize: 0 };
			if (this.options.pattern) this.state.currentDate = format(this.options.pattern, newNow());
			this.filename = this.fileFormatter({
				index: 0,
				date: this.state.currentDate
			});
			if ([
				"a",
				"a+",
				"as",
				"as+"
			].includes(this.options.flags)) this._setExistingSizeAndDate();
			debug(`constructor: create new file ${this.filename}, state=${JSON.stringify(this.state)}`);
			this._renewWriteStream();
		}
		_setExistingSizeAndDate() {
			try {
				const stats = fs.statSync(this.filename);
				this.state.currentSize = stats.size;
				if (this.options.pattern) this.state.currentDate = format(this.options.pattern, stats.mtime);
			} catch (e) {
				return;
			}
		}
		_parseOption(rawOptions) {
			const defaultOptions = {
				maxSize: 0,
				numToKeep: Number.MAX_SAFE_INTEGER,
				encoding: "utf8",
				mode: parseInt("0600", 8),
				flags: "a",
				compress: false,
				keepFileExt: false,
				alwaysIncludePattern: false
			};
			const options = Object.assign({}, defaultOptions, rawOptions);
			if (!options.maxSize) delete options.maxSize;
			else if (options.maxSize <= 0) throw new Error(`options.maxSize (${options.maxSize}) should be > 0`);
			if (options.numBackups || options.numBackups === 0) {
				if (options.numBackups < 0) throw new Error(`options.numBackups (${options.numBackups}) should be >= 0`);
				else if (options.numBackups >= Number.MAX_SAFE_INTEGER) throw new Error(`options.numBackups (${options.numBackups}) should be < Number.MAX_SAFE_INTEGER`);
				else options.numToKeep = options.numBackups + 1;
			} else if (options.numToKeep <= 0) throw new Error(`options.numToKeep (${options.numToKeep}) should be > 0`);
			debug(`_parseOption: creating stream with option=${JSON.stringify(options)}`);
			return options;
		}
		_final(callback) {
			this.currentFileStream.end("", this.options.encoding, callback);
		}
		_write(chunk, encoding, callback) {
			this._shouldRoll().then(() => {
				debug(`_write: writing chunk. file=${this.currentFileStream.path} state=${JSON.stringify(this.state)} chunk=${chunk}`);
				this.currentFileStream.write(chunk, encoding, (e) => {
					this.state.currentSize += chunk.length;
					callback(e);
				});
			});
		}
		async _shouldRoll() {
			if (this._dateChanged() || this._tooBig()) {
				debug(`_shouldRoll: rolling because dateChanged? ${this._dateChanged()} or tooBig? ${this._tooBig()}`);
				await this._roll();
			}
		}
		_dateChanged() {
			return this.state.currentDate && this.state.currentDate !== format(this.options.pattern, newNow());
		}
		_tooBig() {
			return this.state.currentSize >= this.options.maxSize;
		}
		_roll() {
			debug(`_roll: closing the current stream`);
			return new Promise((resolve, reject) => {
				this.currentFileStream.end("", this.options.encoding, () => {
					this._moveOldFiles().then(resolve).catch(reject);
				});
			});
		}
		async _moveOldFiles() {
			const files = await this._getExistingFiles();
			const todaysFiles = this.state.currentDate ? files.filter((f) => f.date === this.state.currentDate) : files;
			for (let i = todaysFiles.length; i >= 0; i--) {
				debug(`_moveOldFiles: i = ${i}`);
				await moveAndMaybeCompressFile(this.fileFormatter({
					date: this.state.currentDate,
					index: i
				}), this.fileFormatter({
					date: this.state.currentDate,
					index: i + 1
				}), {
					compress: this.options.compress && i === 0,
					mode: this.options.mode
				});
			}
			this.state.currentSize = 0;
			this.state.currentDate = this.state.currentDate ? format(this.options.pattern, newNow()) : null;
			debug(`_moveOldFiles: finished rolling files. state=${JSON.stringify(this.state)}`);
			this._renewWriteStream();
			await new Promise((resolve, reject) => {
				this.currentFileStream.write("", "utf8", () => {
					this._clean().then(resolve).catch(reject);
				});
			});
		}
		async _getExistingFiles() {
			const files = await fs.readdir(this.fileObject.dir).catch(
				/* istanbul ignore next: will not happen on windows */
				() => []
			);
			debug(`_getExistingFiles: files=${files}`);
			const existingFileDetails = files.map((n) => this.fileNameParser(n)).filter((n) => n);
			const getKey = (n) => (n.timestamp ? n.timestamp : newNow().getTime()) - n.index;
			existingFileDetails.sort((a, b) => getKey(a) - getKey(b));
			return existingFileDetails;
		}
		_renewWriteStream() {
			const filePath = this.fileFormatter({
				date: this.state.currentDate,
				index: 0
			});
			const mkdir = (dir) => {
				try {
					return fs.mkdirSync(dir, { recursive: true });
				} catch (e) {
					if (e.code === "ENOENT") {
						mkdir(path$6.dirname(dir));
						return mkdir(dir);
					}
					if (e.code !== "EEXIST" && e.code !== "EROFS") throw e;
					else try {
						if (fs.statSync(dir).isDirectory()) return dir;
						throw e;
					} catch (err) {
						throw e;
					}
				}
			};
			mkdir(this.fileObject.dir);
			const ops = {
				flags: this.options.flags,
				encoding: this.options.encoding,
				mode: this.options.mode
			};
			const renameKey = function(obj, oldKey, newKey) {
				obj[newKey] = obj[oldKey];
				delete obj[oldKey];
				return obj;
			};
			fs.appendFileSync(filePath, "", renameKey({ ...ops }, "flags", "flag"));
			this.currentFileStream = fs.createWriteStream(filePath, ops);
			this.currentFileStream.on("error", (e) => {
				this.emit("error", e);
			});
		}
		async _clean() {
			const existingFileDetails = await this._getExistingFiles();
			debug(`_clean: numToKeep = ${this.options.numToKeep}, existingFiles = ${existingFileDetails.length}`);
			debug("_clean: existing files are: ", existingFileDetails);
			if (this._tooManyFiles(existingFileDetails.length)) await deleteFiles(existingFileDetails.slice(0, existingFileDetails.length - this.options.numToKeep).map((f) => path$6.format({
				dir: this.fileObject.dir,
				base: f.filename
			})));
		}
		_tooManyFiles(numFiles) {
			return this.options.numToKeep > 0 && numFiles > this.options.numToKeep;
		}
	};
	module.exports = RollingFileWriteStream;
}));
//#endregion
//#region ../node_modules/streamroller/lib/RollingFileStream.js
var require_RollingFileStream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var RollingFileWriteStream = require_RollingFileWriteStream();
	var RollingFileStream = class extends RollingFileWriteStream {
		constructor(filename, size, backups, options) {
			if (!options) options = {};
			if (size) options.maxSize = size;
			if (!options.numBackups && options.numBackups !== 0) {
				if (!backups && backups !== 0) backups = 1;
				options.numBackups = backups;
			}
			super(filename, options);
			this.backups = options.numBackups;
			this.size = this.options.maxSize;
		}
		get theStream() {
			return this.currentFileStream;
		}
	};
	module.exports = RollingFileStream;
}));
//#endregion
//#region ../node_modules/streamroller/lib/DateRollingFileStream.js
var require_DateRollingFileStream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var RollingFileWriteStream = require_RollingFileWriteStream();
	var DateRollingFileStream = class extends RollingFileWriteStream {
		constructor(filename, pattern, options) {
			if (pattern && typeof pattern === "object") {
				options = pattern;
				pattern = null;
			}
			if (!options) options = {};
			if (!pattern) pattern = "yyyy-MM-dd";
			options.pattern = pattern;
			if (!options.numBackups && options.numBackups !== 0) {
				if (!options.daysToKeep && options.daysToKeep !== 0) options.daysToKeep = 1;
				else process.emitWarning("options.daysToKeep is deprecated due to the confusion it causes when used together with file size rolling. Please use options.numBackups instead.", "DeprecationWarning", "streamroller-DEP0001");
				options.numBackups = options.daysToKeep;
			} else options.daysToKeep = options.numBackups;
			super(filename, options);
			this.mode = this.options.mode;
		}
		get theStream() {
			return this.currentFileStream;
		}
	};
	module.exports = DateRollingFileStream;
}));
//#endregion
//#region ../node_modules/streamroller/lib/index.js
var require_lib$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		RollingFileWriteStream: require_RollingFileWriteStream(),
		RollingFileStream: require_RollingFileStream(),
		DateRollingFileStream: require_DateRollingFileStream()
	};
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/file.js
var require_file = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("log4js:file");
	var path$5 = require("path");
	var streams = require_lib$1();
	var os$4 = require("os");
	var eol = os$4.EOL;
	var mainSighupListenerStarted = false;
	var sighupListeners = /* @__PURE__ */ new Set();
	function mainSighupHandler() {
		sighupListeners.forEach((app) => {
			app.sighupHandler();
		});
	}
	/**
	* File Appender writing the logs to a text file. Supports rolling of logs by size.
	*
	* @param file the file log messages will be written to
	* @param layout a function that takes a logEvent and returns a string
	*   (defaults to basicLayout).
	* @param logSize - the maximum size (in bytes) for a log file,
	*   if not provided then logs won't be rotated.
	* @param numBackups - the number of log files to keep after logSize
	*   has been reached (default 5)
	* @param options - options to be passed to the underlying stream
	* @param timezoneOffset - optional timezone offset in minutes (default system local)
	*/
	function fileAppender(file, layout, logSize, numBackups, options, timezoneOffset) {
		if (typeof file !== "string" || file.length === 0) throw new Error(`Invalid filename: ${file}`);
		else if (file.endsWith(path$5.sep)) throw new Error(`Filename is a directory: ${file}`);
		else if (file.indexOf(`~${path$5.sep}`) === 0) file = file.replace("~", os$4.homedir());
		file = path$5.normalize(file);
		numBackups = !numBackups && numBackups !== 0 ? 5 : numBackups;
		debug("Creating file appender (", file, ", ", logSize, ", ", numBackups, ", ", options, ", ", timezoneOffset, ")");
		function openTheStream(filePath, fileSize, numFiles, opt) {
			const stream = new streams.RollingFileStream(filePath, fileSize, numFiles, opt);
			stream.on("error", (err) => {
				console.error("log4js.fileAppender - Writing to file %s, error happened ", filePath, err);
			});
			stream.on("drain", () => {
				process.emit("log4js:pause", false);
			});
			return stream;
		}
		let writer = openTheStream(file, logSize, numBackups, options);
		const app = function(loggingEvent) {
			if (!writer.writable) return;
			if (options.removeColor === true) {
				const regex = /\x1b[[0-9;]*m/g;
				loggingEvent.data = loggingEvent.data.map((d) => {
					if (typeof d === "string") return d.replace(regex, "");
					return d;
				});
			}
			if (!writer.write(layout(loggingEvent, timezoneOffset) + eol, "utf8")) process.emit("log4js:pause", true);
		};
		app.reopen = function() {
			writer.end(() => {
				writer = openTheStream(file, logSize, numBackups, options);
			});
		};
		app.sighupHandler = function() {
			debug("SIGHUP handler called.");
			app.reopen();
		};
		app.shutdown = function(complete) {
			sighupListeners.delete(app);
			if (sighupListeners.size === 0 && mainSighupListenerStarted) {
				process.removeListener("SIGHUP", mainSighupHandler);
				mainSighupListenerStarted = false;
			}
			writer.end("", "utf-8", complete);
		};
		sighupListeners.add(app);
		if (!mainSighupListenerStarted) {
			process.on("SIGHUP", mainSighupHandler);
			mainSighupListenerStarted = true;
		}
		return app;
	}
	function configure(config, layouts) {
		let layout = layouts.basicLayout;
		if (config.layout) layout = layouts.layout(config.layout.type, config.layout);
		config.mode = config.mode || 384;
		return fileAppender(config.filename, layout, config.maxLogSize, config.backups, config, config.timezoneOffset);
	}
	module.exports.configure = configure;
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/dateFile.js
var require_dateFile = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var streams = require_lib$1();
	var eol = require("os").EOL;
	function openTheStream(filename, pattern, options) {
		const stream = new streams.DateRollingFileStream(filename, pattern, options);
		stream.on("error", (err) => {
			console.error("log4js.dateFileAppender - Writing to file %s, error happened ", filename, err);
		});
		stream.on("drain", () => {
			process.emit("log4js:pause", false);
		});
		return stream;
	}
	/**
	* File appender that rolls files according to a date pattern.
	* @param filename base filename.
	* @param pattern the format that will be added to the end of filename when rolling,
	*          also used to check when to roll files - defaults to '.yyyy-MM-dd'
	* @param layout layout function for log messages - defaults to basicLayout
	* @param options - options to be passed to the underlying stream
	* @param timezoneOffset - optional timezone offset in minutes (default system local)
	*/
	function appender(filename, pattern, layout, options, timezoneOffset) {
		options.maxSize = options.maxLogSize;
		const writer = openTheStream(filename, pattern, options);
		const app = function(logEvent) {
			if (!writer.writable) return;
			if (!writer.write(layout(logEvent, timezoneOffset) + eol, "utf8")) process.emit("log4js:pause", true);
		};
		app.shutdown = function(complete) {
			writer.end("", "utf-8", complete);
		};
		return app;
	}
	function configure(config, layouts) {
		let layout = layouts.basicLayout;
		if (config.layout) layout = layouts.layout(config.layout.type, config.layout);
		if (!config.alwaysIncludePattern) config.alwaysIncludePattern = false;
		config.mode = config.mode || 384;
		return appender(config.filename, config.pattern, layout, config, config.timezoneOffset);
	}
	module.exports.configure = configure;
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/fileSync.js
var require_fileSync = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("log4js:fileSync");
	var path$4 = require("path");
	var fs$3 = require("fs");
	var os$3 = require("os");
	var eol = os$3.EOL;
	function touchFile(file, options) {
		const mkdir = (dir) => {
			try {
				return fs$3.mkdirSync(dir, { recursive: true });
			} catch (e) {
				if (e.code === "ENOENT") {
					mkdir(path$4.dirname(dir));
					return mkdir(dir);
				}
				if (e.code !== "EEXIST" && e.code !== "EROFS") throw e;
				else try {
					if (fs$3.statSync(dir).isDirectory()) return dir;
					throw e;
				} catch (err) {
					throw e;
				}
			}
		};
		mkdir(path$4.dirname(file));
		fs$3.appendFileSync(file, "", {
			mode: options.mode,
			flag: options.flags
		});
	}
	var RollingFileSync = class {
		constructor(filename, maxLogSize, backups, options) {
			debug("In RollingFileStream");
			if (maxLogSize < 0) throw new Error(`maxLogSize (${maxLogSize}) should be > 0`);
			this.filename = filename;
			this.size = maxLogSize;
			this.backups = backups;
			this.options = options;
			this.currentSize = 0;
			function currentFileSize(file) {
				let fileSize = 0;
				try {
					fileSize = fs$3.statSync(file).size;
				} catch (e) {
					touchFile(file, options);
				}
				return fileSize;
			}
			this.currentSize = currentFileSize(this.filename);
		}
		shouldRoll() {
			debug("should roll with current size %d, and max size %d", this.currentSize, this.size);
			return this.currentSize >= this.size;
		}
		roll(filename) {
			const that = this;
			const nameMatcher = new RegExp(`^${path$4.basename(filename)}`);
			function justTheseFiles(item) {
				return nameMatcher.test(item);
			}
			function index(filename_) {
				return parseInt(filename_.slice(`${path$4.basename(filename)}.`.length), 10) || 0;
			}
			function byIndex(a, b) {
				return index(a) - index(b);
			}
			function increaseFileIndex(fileToRename) {
				const idx = index(fileToRename);
				debug(`Index of ${fileToRename} is ${idx}`);
				if (that.backups === 0) fs$3.truncateSync(filename, 0);
				else if (idx < that.backups) {
					try {
						fs$3.unlinkSync(`${filename}.${idx + 1}`);
					} catch (e) {}
					debug(`Renaming ${fileToRename} -> ${filename}.${idx + 1}`);
					fs$3.renameSync(path$4.join(path$4.dirname(filename), fileToRename), `${filename}.${idx + 1}`);
				}
			}
			function renameTheFiles() {
				debug("Renaming the old files");
				fs$3.readdirSync(path$4.dirname(filename)).filter(justTheseFiles).sort(byIndex).reverse().forEach(increaseFileIndex);
			}
			debug("Rolling, rolling, rolling");
			renameTheFiles();
		}
		write(chunk, encoding) {
			const that = this;
			function writeTheChunk() {
				debug("writing the chunk to the file");
				that.currentSize += chunk.length;
				fs$3.appendFileSync(that.filename, chunk);
			}
			debug("in write");
			if (this.shouldRoll()) {
				this.currentSize = 0;
				this.roll(this.filename);
			}
			writeTheChunk();
		}
	};
	/**
	* File Appender writing the logs to a text file. Supports rolling of logs by size.
	*
	* @param file the file log messages will be written to
	* @param layout a function that takes a logevent and returns a string
	*   (defaults to basicLayout).
	* @param logSize - the maximum size (in bytes) for a log file,
	*   if not provided then logs won't be rotated.
	* @param numBackups - the number of log files to keep after logSize
	*   has been reached (default 5)
	* @param options - options to be passed to the underlying stream
	* @param timezoneOffset - optional timezone offset in minutes (default system local)
	*/
	function fileAppender(file, layout, logSize, numBackups, options, timezoneOffset) {
		if (typeof file !== "string" || file.length === 0) throw new Error(`Invalid filename: ${file}`);
		else if (file.endsWith(path$4.sep)) throw new Error(`Filename is a directory: ${file}`);
		else if (file.indexOf(`~${path$4.sep}`) === 0) file = file.replace("~", os$3.homedir());
		file = path$4.normalize(file);
		numBackups = !numBackups && numBackups !== 0 ? 5 : numBackups;
		debug("Creating fileSync appender (", file, ", ", logSize, ", ", numBackups, ", ", options, ", ", timezoneOffset, ")");
		function openTheStream(filePath, fileSize, numFiles) {
			let stream;
			if (fileSize) stream = new RollingFileSync(filePath, fileSize, numFiles, options);
			else stream = ((f) => {
				touchFile(f, options);
				return { write(data) {
					fs$3.appendFileSync(f, data);
				} };
			})(filePath);
			return stream;
		}
		const logFile = openTheStream(file, logSize, numBackups);
		return (loggingEvent) => {
			logFile.write(layout(loggingEvent, timezoneOffset) + eol);
		};
	}
	function configure(config, layouts) {
		let layout = layouts.basicLayout;
		if (config.layout) layout = layouts.layout(config.layout.type, config.layout);
		const options = {
			flags: config.flags || "a",
			encoding: config.encoding || "utf8",
			mode: config.mode || 384
		};
		return fileAppender(config.filename, layout, config.maxLogSize, config.backups, options, config.timezoneOffset);
	}
	module.exports.configure = configure;
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/tcp.js
var require_tcp = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("log4js:tcp");
	var net$1 = require("net");
	function appender(config, layout) {
		let canWrite = false;
		const buffer = [];
		let socket;
		let shutdownAttempts = 3;
		let endMsg = "__LOG4JS__";
		function write(loggingEvent) {
			debug("Writing log event to socket");
			canWrite = socket.write(`${layout(loggingEvent)}${endMsg}`, "utf8");
		}
		function emptyBuffer() {
			let evt;
			debug("emptying buffer");
			while (evt = buffer.shift()) write(evt);
		}
		function createSocket() {
			debug(`appender creating socket to ${config.host || "localhost"}:${config.port || 5e3}`);
			endMsg = `${config.endMsg || "__LOG4JS__"}`;
			socket = net$1.createConnection(config.port || 5e3, config.host || "localhost");
			socket.on("connect", () => {
				debug("socket connected");
				emptyBuffer();
				canWrite = true;
			});
			socket.on("drain", () => {
				debug("drain event received, emptying buffer");
				canWrite = true;
				emptyBuffer();
			});
			socket.on("timeout", socket.end.bind(socket));
			socket.on("error", (e) => {
				debug("connection error", e);
				canWrite = false;
				emptyBuffer();
			});
			socket.on("close", createSocket);
		}
		createSocket();
		function log(loggingEvent) {
			if (canWrite) write(loggingEvent);
			else {
				debug("buffering log event because it cannot write at the moment");
				buffer.push(loggingEvent);
			}
		}
		log.shutdown = function(cb) {
			debug("shutdown called");
			if (buffer.length && shutdownAttempts) {
				debug("buffer has items, waiting 100ms to empty");
				shutdownAttempts -= 1;
				setTimeout(() => {
					log.shutdown(cb);
				}, 100);
			} else {
				socket.removeAllListeners("close");
				socket.end(cb);
			}
		};
		return log;
	}
	function configure(config, layouts) {
		debug(`configure with config = ${config}`);
		let layout = function(loggingEvent) {
			return loggingEvent.serialise();
		};
		if (config.layout) layout = layouts.layout(config.layout.type, config.layout);
		return appender(config, layout);
	}
	module.exports.configure = configure;
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/index.js
var require_appenders = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var path$3 = require("path");
	var debug = require_src$1()("log4js:appenders");
	var configuration = require_configuration();
	var clustering = require_clustering();
	var levels = require_levels();
	var layouts = require_layouts();
	var adapters = require_adapters();
	var coreAppenders = /* @__PURE__ */ new Map();
	coreAppenders.set("console", require_console());
	coreAppenders.set("stdout", require_stdout());
	coreAppenders.set("stderr", require_stderr());
	coreAppenders.set("logLevelFilter", require_logLevelFilter());
	coreAppenders.set("categoryFilter", require_categoryFilter());
	coreAppenders.set("noLogFilter", require_noLogFilter());
	coreAppenders.set("file", require_file());
	coreAppenders.set("dateFile", require_dateFile());
	coreAppenders.set("fileSync", require_fileSync());
	coreAppenders.set("tcp", require_tcp());
	var appenders = /* @__PURE__ */ new Map();
	var tryLoading = (modulePath, config) => {
		let resolvedPath;
		try {
			const modulePathCJS = `${modulePath}.cjs`;
			resolvedPath = require.resolve(modulePathCJS);
			debug("Loading module from ", modulePathCJS);
		} catch (e) {
			resolvedPath = modulePath;
			debug("Loading module from ", modulePath);
		}
		try {
			return require(resolvedPath);
		} catch (e) {
			configuration.throwExceptionIf(config, e.code !== "MODULE_NOT_FOUND", `appender "${modulePath}" could not be loaded (error was: ${e})`);
			return;
		}
	};
	var loadAppenderModule = (type, config) => coreAppenders.get(type) || tryLoading(`./${type}`, config) || tryLoading(type, config) || require.main && require.main.filename && tryLoading(path$3.join(path$3.dirname(require.main.filename), type), config) || tryLoading(path$3.join(process.cwd(), type), config);
	var appendersLoading = /* @__PURE__ */ new Set();
	var getAppender = (name, config) => {
		if (appenders.has(name)) return appenders.get(name);
		if (!config.appenders[name]) return false;
		if (appendersLoading.has(name)) throw new Error(`Dependency loop detected for appender ${name}.`);
		appendersLoading.add(name);
		debug(`Creating appender ${name}`);
		const appender = createAppender(name, config);
		appendersLoading.delete(name);
		appenders.set(name, appender);
		return appender;
	};
	var createAppender = (name, config) => {
		const appenderConfig = config.appenders[name];
		const appenderModule = appenderConfig.type.configure ? appenderConfig.type : loadAppenderModule(appenderConfig.type, config);
		configuration.throwExceptionIf(config, configuration.not(appenderModule), `appender "${name}" is not valid (type "${appenderConfig.type}" could not be found)`);
		if (appenderModule.appender) {
			process.emitWarning(`Appender ${appenderConfig.type} exports an appender function.`, "DeprecationWarning", "log4js-node-DEP0001");
			debug("[log4js-node-DEP0001]", `DEPRECATION: Appender ${appenderConfig.type} exports an appender function.`);
		}
		if (appenderModule.shutdown) {
			process.emitWarning(`Appender ${appenderConfig.type} exports a shutdown function.`, "DeprecationWarning", "log4js-node-DEP0002");
			debug("[log4js-node-DEP0002]", `DEPRECATION: Appender ${appenderConfig.type} exports a shutdown function.`);
		}
		debug(`${name}: clustering.isMaster ? ${clustering.isMaster()}`);
		debug(`${name}: appenderModule is ${require("util").inspect(appenderModule)}`);
		return clustering.onlyOnMaster(
			() => {
				debug(`calling appenderModule.configure for ${name} / ${appenderConfig.type}`);
				return appenderModule.configure(adapters.modifyConfig(appenderConfig), layouts, (appender) => getAppender(appender, config), levels);
			},
			/* istanbul ignore next: fn never gets called by non-master yet needed to pass config validation */
			() => {}
		);
	};
	var setup = (config) => {
		appenders.clear();
		appendersLoading.clear();
		if (!config) return;
		const usedAppenders = [];
		Object.values(config.categories).forEach((category) => {
			usedAppenders.push(...category.appenders);
		});
		Object.keys(config.appenders).forEach((name) => {
			if (usedAppenders.includes(name) || config.appenders[name].type === "tcp-server" || config.appenders[name].type === "multiprocess") getAppender(name, config);
		});
	};
	var init = () => {
		setup();
	};
	init();
	configuration.addListener((config) => {
		configuration.throwExceptionIf(config, configuration.not(configuration.anObject(config.appenders)), "must have a property \"appenders\" of type object.");
		const appenderNames = Object.keys(config.appenders);
		configuration.throwExceptionIf(config, configuration.not(appenderNames.length), "must define at least one appender.");
		appenderNames.forEach((name) => {
			configuration.throwExceptionIf(config, configuration.not(config.appenders[name].type), `appender "${name}" is not valid (must be an object with property "type")`);
		});
	});
	configuration.addListener(setup);
	module.exports = appenders;
	module.exports.init = init;
}));
//#endregion
//#region ../node_modules/log4js/lib/categories.js
var require_categories = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("log4js:categories");
	var configuration = require_configuration();
	var levels = require_levels();
	var appenders = require_appenders();
	var categories = /* @__PURE__ */ new Map();
	/**
	* Add inherited config to this category.  That includes extra appenders from parent,
	* and level, if none is set on this category.
	* This is recursive, so each parent also gets loaded with inherited appenders.
	* Inheritance is blocked if a category has inherit=false
	* @param  {*} config
	* @param  {*} category the child category
	* @param  {string} categoryName dotted path to category
	* @return {void}
	*/
	function inheritFromParent(config, category, categoryName) {
		if (category.inherit === false) return;
		const lastDotIndex = categoryName.lastIndexOf(".");
		if (lastDotIndex < 0) return;
		const parentCategoryName = categoryName.slice(0, lastDotIndex);
		let parentCategory = config.categories[parentCategoryName];
		if (!parentCategory) parentCategory = {
			inherit: true,
			appenders: []
		};
		inheritFromParent(config, parentCategory, parentCategoryName);
		if (!config.categories[parentCategoryName] && parentCategory.appenders && parentCategory.appenders.length && parentCategory.level) config.categories[parentCategoryName] = parentCategory;
		category.appenders = category.appenders || [];
		category.level = category.level || parentCategory.level;
		parentCategory.appenders.forEach((ap) => {
			if (!category.appenders.includes(ap)) category.appenders.push(ap);
		});
		category.parent = parentCategory;
	}
	/**
	* Walk all categories in the config, and pull down any configuration from parent to child.
	* This includes inherited appenders, and level, where level is not set.
	* Inheritance is skipped where a category has inherit=false.
	* @param  {*} config
	*/
	function addCategoryInheritance(config) {
		if (!config.categories) return;
		Object.keys(config.categories).forEach((name) => {
			const category = config.categories[name];
			inheritFromParent(config, category, name);
		});
	}
	configuration.addPreProcessingListener((config) => addCategoryInheritance(config));
	configuration.addListener((config) => {
		configuration.throwExceptionIf(config, configuration.not(configuration.anObject(config.categories)), "must have a property \"categories\" of type object.");
		const categoryNames = Object.keys(config.categories);
		configuration.throwExceptionIf(config, configuration.not(categoryNames.length), "must define at least one category.");
		categoryNames.forEach((name) => {
			const category = config.categories[name];
			configuration.throwExceptionIf(config, [configuration.not(category.appenders), configuration.not(category.level)], `category "${name}" is not valid (must be an object with properties "appenders" and "level")`);
			configuration.throwExceptionIf(config, configuration.not(Array.isArray(category.appenders)), `category "${name}" is not valid (appenders must be an array of appender names)`);
			configuration.throwExceptionIf(config, configuration.not(category.appenders.length), `category "${name}" is not valid (appenders must contain at least one appender name)`);
			if (Object.prototype.hasOwnProperty.call(category, "enableCallStack")) configuration.throwExceptionIf(config, typeof category.enableCallStack !== "boolean", `category "${name}" is not valid (enableCallStack must be boolean type)`);
			category.appenders.forEach((appender) => {
				configuration.throwExceptionIf(config, configuration.not(appenders.get(appender)), `category "${name}" is not valid (appender "${appender}" is not defined)`);
			});
			configuration.throwExceptionIf(config, configuration.not(levels.getLevel(category.level)), `category "${name}" is not valid (level "${category.level}" not recognised; valid levels are ${levels.levels.join(", ")})`);
		});
		configuration.throwExceptionIf(config, configuration.not(config.categories.default), "must define a \"default\" category.");
	});
	var setup = (config) => {
		categories.clear();
		if (!config) return;
		Object.keys(config.categories).forEach((name) => {
			const category = config.categories[name];
			const categoryAppenders = [];
			category.appenders.forEach((appender) => {
				categoryAppenders.push(appenders.get(appender));
				debug(`Creating category ${name}`);
				categories.set(name, {
					appenders: categoryAppenders,
					level: levels.getLevel(category.level),
					enableCallStack: category.enableCallStack || false
				});
			});
		});
	};
	var init = () => {
		setup();
	};
	init();
	configuration.addListener(setup);
	var configForCategory = (category) => {
		debug(`configForCategory: searching for config for ${category}`);
		if (categories.has(category)) {
			debug(`configForCategory: ${category} exists in config, returning it`);
			return categories.get(category);
		}
		let sourceCategoryConfig;
		if (category.indexOf(".") > 0) {
			debug(`configForCategory: ${category} has hierarchy, cloning from parents`);
			sourceCategoryConfig = { ...configForCategory(category.slice(0, category.lastIndexOf("."))) };
		} else {
			if (!categories.has("default")) setup({ categories: { default: {
				appenders: ["out"],
				level: "OFF"
			} } });
			debug("configForCategory: cloning default category");
			sourceCategoryConfig = { ...categories.get("default") };
		}
		categories.set(category, sourceCategoryConfig);
		return sourceCategoryConfig;
	};
	var appendersForCategory = (category) => configForCategory(category).appenders;
	var getLevelForCategory = (category) => configForCategory(category).level;
	var setLevelForCategory = (category, level) => {
		configForCategory(category).level = level;
	};
	var getEnableCallStackForCategory = (category) => configForCategory(category).enableCallStack === true;
	var setEnableCallStackForCategory = (category, useCallStack) => {
		configForCategory(category).enableCallStack = useCallStack;
	};
	module.exports = categories;
	module.exports = Object.assign(module.exports, {
		appendersForCategory,
		getLevelForCategory,
		setLevelForCategory,
		getEnableCallStackForCategory,
		setEnableCallStackForCategory,
		init
	});
}));
//#endregion
//#region ../node_modules/log4js/lib/logger.js
var require_logger = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("log4js:logger");
	var LoggingEvent = require_LoggingEvent();
	var levels = require_levels();
	var clustering = require_clustering();
	var categories = require_categories();
	var configuration = require_configuration();
	var stackReg = /^(?:\s*)at (?:(.+) \()?(?:([^(]+?):(\d+):(\d+))\)?$/;
	/**
	* The top entry is the Error
	*/
	var baseCallStackSkip = 1;
	/**
	* The _log function is 3 levels deep, we need to skip those to make it to the callSite
	*/
	var defaultErrorCallStackSkip = 3;
	/**
	*
	* @param {Error} data
	* @param {number} skipIdx
	* @returns {import('../types/log4js').CallStack | null}
	*/
	function defaultParseCallStack(data, skipIdx = 4) {
		try {
			const stacklines = data.stack.split("\n").slice(skipIdx);
			if (!stacklines.length) return null;
			const lineMatch = stackReg.exec(stacklines[0]);
			/* istanbul ignore else: failsafe */
			if (lineMatch && lineMatch.length === 5) {
				let className = "";
				let functionName = "";
				let functionAlias = "";
				if (lineMatch[1] && lineMatch[1] !== "") {
					[functionName, functionAlias] = lineMatch[1].replace(/[[\]]/g, "").split(" as ");
					functionAlias = functionAlias || "";
					if (functionName.includes(".")) [className, functionName] = functionName.split(".");
				}
				return {
					fileName: lineMatch[2],
					lineNumber: parseInt(lineMatch[3], 10),
					columnNumber: parseInt(lineMatch[4], 10),
					callStack: stacklines.join("\n"),
					className,
					functionName,
					functionAlias,
					callerName: lineMatch[1] || ""
				};
			} else console.error("log4js.logger - defaultParseCallStack error");
		} catch (err) {
			console.error("log4js.logger - defaultParseCallStack error", err);
		}
		return null;
	}
	/**
	* Logger to log messages.
	* use {@see log4js#getLogger(String)} to get an instance.
	*
	* @name Logger
	* @namespace Log4js
	* @param name name of category to log to
	* @param level - the loglevel for the category
	* @param dispatch - the function which will receive the logevents
	*
	* @author Stephan Strittmatter
	*/
	var Logger = class {
		constructor(name) {
			if (!name) throw new Error("No category provided.");
			this.category = name;
			this.context = {};
			/** @private */
			this.callStackSkipIndex = 0;
			/** @private */
			this.parseCallStack = defaultParseCallStack;
			debug(`Logger created (${this.category}, ${this.level})`);
		}
		get level() {
			return levels.getLevel(categories.getLevelForCategory(this.category), levels.OFF);
		}
		set level(level) {
			categories.setLevelForCategory(this.category, levels.getLevel(level, this.level));
		}
		get useCallStack() {
			return categories.getEnableCallStackForCategory(this.category);
		}
		set useCallStack(bool) {
			categories.setEnableCallStackForCategory(this.category, bool === true);
		}
		get callStackLinesToSkip() {
			return this.callStackSkipIndex;
		}
		set callStackLinesToSkip(number) {
			if (typeof number !== "number") throw new TypeError("Must be a number");
			if (number < 0) throw new RangeError("Must be >= 0");
			this.callStackSkipIndex = number;
		}
		log(level, ...args) {
			const logLevel = levels.getLevel(level);
			if (!logLevel) {
				if (configuration.validIdentifier(level) && args.length > 0) {
					this.log(levels.WARN, "log4js:logger.log: valid log-level not found as first parameter given:", level);
					this.log(levels.INFO, `[${level}]`, ...args);
				} else this.log(levels.INFO, level, ...args);
			} else if (this.isLevelEnabled(logLevel)) this._log(logLevel, args);
		}
		isLevelEnabled(otherLevel) {
			return this.level.isLessThanOrEqualTo(otherLevel);
		}
		_log(level, data) {
			debug(`sending log data (${level}) to appenders`);
			const error = data.find((item) => item instanceof Error);
			let callStack;
			if (this.useCallStack) {
				try {
					if (error) callStack = this.parseCallStack(error, this.callStackSkipIndex + baseCallStackSkip);
				} catch (_err) {}
				callStack = callStack || this.parseCallStack(/* @__PURE__ */ new Error(), this.callStackSkipIndex + defaultErrorCallStackSkip + baseCallStackSkip);
			}
			const loggingEvent = new LoggingEvent(this.category, level, data, this.context, callStack, error);
			clustering.send(loggingEvent);
		}
		addContext(key, value) {
			this.context[key] = value;
		}
		removeContext(key) {
			delete this.context[key];
		}
		clearContext() {
			this.context = {};
		}
		setParseCallStackFunction(parseFunction) {
			if (typeof parseFunction === "function") this.parseCallStack = parseFunction;
			else if (typeof parseFunction === "undefined") this.parseCallStack = defaultParseCallStack;
			else throw new TypeError("Invalid type passed to setParseCallStackFunction");
		}
	};
	function addLevelMethods(target) {
		const level = levels.getLevel(target);
		const levelMethod = level.toString().toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
		const isLevelMethod = levelMethod[0].toUpperCase() + levelMethod.slice(1);
		Logger.prototype[`is${isLevelMethod}Enabled`] = function() {
			return this.isLevelEnabled(level);
		};
		Logger.prototype[levelMethod] = function(...args) {
			this.log(level, ...args);
		};
	}
	levels.levels.forEach(addLevelMethods);
	configuration.addListener(() => {
		levels.levels.forEach(addLevelMethods);
	});
	module.exports = Logger;
}));
//#endregion
//#region ../node_modules/log4js/lib/connect-logger.js
var require_connect_logger = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var levels = require_levels();
	var DEFAULT_FORMAT = ":remote-addr - - \":method :url HTTP/:http-version\" :status :content-length \":referrer\" \":user-agent\"";
	/**
	* Return request url path,
	* adding this function prevents the Cyclomatic Complexity,
	* for the assemble_tokens function at low, to pass the tests.
	*
	* @param  {IncomingMessage} req
	* @return {string}
	* @api private
	*/
	function getUrl(req) {
		return req.originalUrl || req.url;
	}
	/**
	* Adds custom {token, replacement} objects to defaults,
	* overwriting the defaults if any tokens clash
	*
	* @param  {IncomingMessage} req
	* @param  {ServerResponse} res
	* @param  {Array} customTokens
	*    [{ token: string-or-regexp, replacement: string-or-replace-function }]
	* @return {Array}
	*/
	function assembleTokens(req, res, customTokens) {
		const arrayUniqueTokens = (array) => {
			const a = array.concat();
			for (let i = 0; i < a.length; ++i) for (let j = i + 1; j < a.length; ++j) if (a[i].token == a[j].token) a.splice(j--, 1);
			return a;
		};
		const defaultTokens = [];
		defaultTokens.push({
			token: ":url",
			replacement: getUrl(req)
		});
		defaultTokens.push({
			token: ":protocol",
			replacement: req.protocol
		});
		defaultTokens.push({
			token: ":hostname",
			replacement: req.hostname
		});
		defaultTokens.push({
			token: ":method",
			replacement: req.method
		});
		defaultTokens.push({
			token: ":status",
			replacement: res.__statusCode || res.statusCode
		});
		defaultTokens.push({
			token: ":response-time",
			replacement: res.responseTime
		});
		defaultTokens.push({
			token: ":date",
			replacement: (/* @__PURE__ */ new Date()).toUTCString()
		});
		defaultTokens.push({
			token: ":referrer",
			replacement: req.headers.referer || req.headers.referrer || ""
		});
		defaultTokens.push({
			token: ":http-version",
			replacement: `${req.httpVersionMajor}.${req.httpVersionMinor}`
		});
		defaultTokens.push({
			token: ":remote-addr",
			replacement: req.headers["x-forwarded-for"] || req.ip || req._remoteAddress || req.socket && (req.socket.remoteAddress || req.socket.socket && req.socket.socket.remoteAddress)
		});
		defaultTokens.push({
			token: ":user-agent",
			replacement: req.headers["user-agent"]
		});
		defaultTokens.push({
			token: ":content-length",
			replacement: res.getHeader("content-length") || res.__headers && res.__headers["Content-Length"] || "-"
		});
		defaultTokens.push({
			token: /:req\[([^\]]+)]/g,
			replacement(_, field) {
				return req.headers[field.toLowerCase()];
			}
		});
		defaultTokens.push({
			token: /:res\[([^\]]+)]/g,
			replacement(_, field) {
				return res.getHeader(field.toLowerCase()) || res.__headers && res.__headers[field];
			}
		});
		return arrayUniqueTokens(customTokens.concat(defaultTokens));
	}
	/**
	* Return formatted log line.
	*
	* @param  {string} str
	* @param {Array} tokens
	* @return {string}
	* @api private
	*/
	function format(str, tokens) {
		for (let i = 0; i < tokens.length; i++) str = str.replace(tokens[i].token, tokens[i].replacement);
		return str;
	}
	/**
	* Return RegExp Object about nolog
	*
	* @param  {(string|Array)} nolog
	* @return {RegExp}
	* @api private
	*
	* syntax
	*  1. String
	*   1.1 "\\.gif"
	*         NOT LOGGING http://example.com/hoge.gif and http://example.com/hoge.gif?fuga
	*         LOGGING http://example.com/hoge.agif
	*   1.2 in "\\.gif|\\.jpg$"
	*         NOT LOGGING http://example.com/hoge.gif and
	*           http://example.com/hoge.gif?fuga and http://example.com/hoge.jpg?fuga
	*         LOGGING http://example.com/hoge.agif,
	*           http://example.com/hoge.ajpg and http://example.com/hoge.jpg?hoge
	*   1.3 in "\\.(gif|jpe?g|png)$"
	*         NOT LOGGING http://example.com/hoge.gif and http://example.com/hoge.jpeg
	*         LOGGING http://example.com/hoge.gif?uid=2 and http://example.com/hoge.jpg?pid=3
	*  2. RegExp
	*   2.1 in /\.(gif|jpe?g|png)$/
	*         SAME AS 1.3
	*  3. Array
	*   3.1 ["\\.jpg$", "\\.png", "\\.gif"]
	*         SAME AS "\\.jpg|\\.png|\\.gif"
	*/
	function createNoLogCondition(nolog) {
		let regexp = null;
		if (nolog instanceof RegExp) regexp = nolog;
		if (typeof nolog === "string") regexp = new RegExp(nolog);
		if (Array.isArray(nolog)) {
			const regexpsAsStrings = nolog.map((reg) => reg.source ? reg.source : reg);
			regexp = new RegExp(regexpsAsStrings.join("|"));
		}
		return regexp;
	}
	/**
	* Allows users to define rules around status codes to assign them to a specific
	* logging level.
	* There are two types of rules:
	*   - RANGE: matches a code within a certain range
	*     E.g. { 'from': 200, 'to': 299, 'level': 'info' }
	*   - CONTAINS: matches a code to a set of expected codes
	*     E.g. { 'codes': [200, 203], 'level': 'debug' }
	* Note*: Rules are respected only in order of prescendence.
	*
	* @param {Number} statusCode
	* @param {Level} currentLevel
	* @param {Object} ruleSet
	* @return {Level}
	* @api private
	*/
	function matchRules(statusCode, currentLevel, ruleSet) {
		let level = currentLevel;
		if (ruleSet) {
			const matchedRule = ruleSet.find((rule) => {
				let ruleMatched = false;
				if (rule.from && rule.to) ruleMatched = statusCode >= rule.from && statusCode <= rule.to;
				else ruleMatched = rule.codes.indexOf(statusCode) !== -1;
				return ruleMatched;
			});
			if (matchedRule) level = levels.getLevel(matchedRule.level, level);
		}
		return level;
	}
	/**
	* Log requests with the given `options` or a `format` string.
	*
	* Options:
	*
	*   - `format`        Format string, see below for tokens
	*   - `level`         A log4js levels instance. Supports also 'auto'
	*   - `nolog`         A string or RegExp to exclude target logs or function(req, res): boolean
	*   - `statusRules`   A array of rules for setting specific logging levels base on status codes
	*   - `context`       Whether to add a response of express to the context
	*
	* Tokens:
	*
	*   - `:req[header]` ex: `:req[Accept]`
	*   - `:res[header]` ex: `:res[Content-Length]`
	*   - `:http-version`
	*   - `:response-time`
	*   - `:remote-addr`
	*   - `:date`
	*   - `:method`
	*   - `:url`
	*   - `:referrer`
	*   - `:user-agent`
	*   - `:status`
	*
	* @return {Function}
	* @param logger4js
	* @param options
	* @api public
	*/
	module.exports = function getLogger(logger4js, options) {
		if (typeof options === "string" || typeof options === "function") options = { format: options };
		else options = options || {};
		const thisLogger = logger4js;
		let level = levels.getLevel(options.level, levels.INFO);
		const fmt = options.format || DEFAULT_FORMAT;
		return (req, res, next) => {
			if (typeof req._logging !== "undefined") return next();
			if (typeof options.nolog !== "function") {
				const nolog = createNoLogCondition(options.nolog);
				if (nolog && nolog.test(req.originalUrl)) return next();
			}
			if (thisLogger.isLevelEnabled(level) || options.level === "auto") {
				const start = /* @__PURE__ */ new Date();
				const { writeHead } = res;
				req._logging = true;
				res.writeHead = (code, headers) => {
					res.writeHead = writeHead;
					res.writeHead(code, headers);
					res.__statusCode = code;
					res.__headers = headers || {};
				};
				let finished = false;
				const handler = () => {
					if (finished) return;
					finished = true;
					if (typeof options.nolog === "function") {
						if (options.nolog(req, res) === true) {
							req._logging = false;
							return;
						}
					}
					res.responseTime = /* @__PURE__ */ new Date() - start;
					if (res.statusCode && options.level === "auto") {
						level = levels.INFO;
						if (res.statusCode >= 300) level = levels.WARN;
						if (res.statusCode >= 400) level = levels.ERROR;
					}
					level = matchRules(res.statusCode, level, options.statusRules);
					const combinedTokens = assembleTokens(req, res, options.tokens || []);
					if (options.context) thisLogger.addContext("res", res);
					if (typeof fmt === "function") {
						const line = fmt(req, res, (str) => format(str, combinedTokens));
						if (line) thisLogger.log(level, line);
					} else thisLogger.log(level, format(fmt, combinedTokens));
					if (options.context) thisLogger.removeContext("res");
				};
				res.on("end", handler);
				res.on("finish", handler);
				res.on("error", handler);
				res.on("close", handler);
			}
			return next();
		};
	};
}));
//#endregion
//#region ../node_modules/log4js/lib/appenders/recording.js
var require_recording = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$1()("log4js:recording");
	var recordedEvents = [];
	function configure() {
		return function(logEvent) {
			debug(`received logEvent, number of events now ${recordedEvents.length + 1}`);
			debug("log event was ", logEvent);
			recordedEvents.push(logEvent);
		};
	}
	function replay() {
		return recordedEvents.slice();
	}
	function reset() {
		recordedEvents.length = 0;
	}
	module.exports = {
		configure,
		replay,
		playback: replay,
		reset,
		erase: reset
	};
}));
//#endregion
//#region ../node_modules/log4js/lib/log4js.js
var require_log4js = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* @fileoverview log4js is a library to log in JavaScript in similar manner
	* than in log4j for Java (but not really).
	*
	* <h3>Example:</h3>
	* <pre>
	*  const logging = require('log4js');
	*  const log = logging.getLogger('some-category');
	*
	*  //call the log
	*  log.trace('trace me' );
	* </pre>
	*
	* NOTE: the authors below are the original browser-based log4js authors
	* don't try to contact them about bugs in this version :)
	* @author Stephan Strittmatter - http://jroller.com/page/stritti
	* @author Seth Chisamore - http://www.chisamore.com
	* @since 2005-05-20
	* Website: http://log4js.berlios.de
	*/
	var debug = require_src$1()("log4js:main");
	var fs$2 = require("fs");
	var deepClone = require_rfdc()({ proto: true });
	var configuration = require_configuration();
	var layouts = require_layouts();
	var levels = require_levels();
	var appenders = require_appenders();
	var categories = require_categories();
	var Logger = require_logger();
	var clustering = require_clustering();
	var connectLogger = require_connect_logger();
	var recordingModule = require_recording();
	var enabled = false;
	function sendLogEventToAppender(logEvent) {
		if (!enabled) return;
		debug("Received log event ", logEvent);
		categories.appendersForCategory(logEvent.categoryName).forEach((appender) => {
			appender(logEvent);
		});
	}
	function loadConfigurationFile(filename) {
		debug(`Loading configuration from ${filename}`);
		try {
			return JSON.parse(fs$2.readFileSync(filename, "utf8"));
		} catch (e) {
			throw new Error(`Problem reading config from file "${filename}". Error was ${e.message}`, e);
		}
	}
	function configure(configurationFileOrObject) {
		if (enabled) shutdown();
		let configObject = configurationFileOrObject;
		if (typeof configObject === "string") configObject = loadConfigurationFile(configurationFileOrObject);
		debug(`Configuration is ${configObject}`);
		configuration.configure(deepClone(configObject));
		clustering.onMessage(sendLogEventToAppender);
		enabled = true;
		return log4js;
	}
	function isConfigured() {
		return enabled;
	}
	function recording() {
		return recordingModule;
	}
	/**
	* This callback type is called `shutdownCallback` and is displayed as a global symbol.
	*
	* @callback shutdownCallback
	* @param {Error} [error]
	*/
	/**
	* Shutdown all log appenders. This will first disable all writing to appenders
	* and then call the shutdown function each appender.
	*
	* @param {shutdownCallback} [callback] - The callback to be invoked once all appenders have
	*  shutdown. If an error occurs, the callback will be given the error object
	*  as the first argument.
	*/
	function shutdown(callback = () => {}) {
		if (typeof callback !== "function") throw new TypeError("Invalid callback passed to shutdown");
		debug("Shutdown called. Disabling all log writing.");
		enabled = false;
		const appendersToCheck = Array.from(appenders.values());
		appenders.init();
		categories.init();
		const shutdownFunctions = appendersToCheck.reduce((accum, next) => next.shutdown ? accum + 1 : accum, 0);
		if (shutdownFunctions === 0) {
			debug("No appenders with shutdown functions found.");
			callback();
		}
		let completed = 0;
		let error;
		debug(`Found ${shutdownFunctions} appenders with shutdown functions.`);
		function complete(err) {
			error = error || err;
			completed += 1;
			debug(`Appender shutdowns complete: ${completed} / ${shutdownFunctions}`);
			if (completed >= shutdownFunctions) {
				debug("All shutdown functions completed.");
				callback(error);
			}
		}
		appendersToCheck.filter((a) => a.shutdown).forEach((a) => a.shutdown(complete));
	}
	/**
	* Get a logger instance.
	* @static
	* @param {string} [category=default]
	* @return {Logger} instance of logger for the category
	*/
	function getLogger(category) {
		if (!enabled) configure(process.env.LOG4JS_CONFIG || {
			appenders: { out: { type: "stdout" } },
			categories: { default: {
				appenders: ["out"],
				level: "OFF"
			} }
		});
		return new Logger(category || "default");
	}
	/**
	* @name log4js
	* @namespace Log4js
	* @property getLogger
	* @property configure
	* @property shutdown
	*/
	var log4js = {
		getLogger,
		configure,
		isConfigured,
		shutdown,
		connectLogger,
		levels,
		addLayout: layouts.addLayout,
		recording
	};
	module.exports = log4js;
}));
//#endregion
//#region ../src/util/logger.ts
var logger_exports = /* @__PURE__ */ __exportAll({ default: () => logger });
function logger(name = "mkdp") {
	return import_log4js.default.getLogger(name);
}
var import_log4js, MAX_LOG_SIZE, MAX_LOG_BACKUPS, LOG_FILE_PATH, level;
var init_logger = __esmMin((() => {
	import_log4js = /* @__PURE__ */ __toESM(require_log4js());
	MAX_LOG_SIZE = 1048576;
	MAX_LOG_BACKUPS = 10;
	LOG_FILE_PATH = process.env.NVIM_MKDP_LOG_FILE || node_path.default.join(node_os.default.tmpdir(), "mkdp-nvim.log");
	level = process.env.NVIM_MKDP_LOG_LEVEL || "info";
	if (level === "debug") node_fs.default.writeFileSync(LOG_FILE_PATH, "", "utf8");
	if (!(process.getuid && process.getuid() === 0)) import_log4js.default.configure({
		appenders: { out: {
			type: "file",
			filename: LOG_FILE_PATH,
			maxLogSize: MAX_LOG_SIZE,
			backups: MAX_LOG_BACKUPS,
			layout: {
				type: "pattern",
				pattern: `%d{yyyy-MM-dd hh:mm:ss} %p (pid:${process.pid}) [%c] - %m`
			}
		} },
		categories: { default: {
			appenders: ["out"],
			level
		} }
	});
}));
//#endregion
//#region ../src/attach/index.ts
var attach_exports = /* @__PURE__ */ __exportAll({ default: () => attach_default });
function attach_default(options) {
	const nvim = (0, import_lib.attach)(options);
	nvim.on("notification", async (method, args) => {
		const bufnr = (args[0] || args).bufnr;
		const buffer = (await nvim.buffers).find((b) => b.id === bufnr);
		if (method === "refresh_content" && buffer) {
			const winline = await nvim.call("winline");
			const currentWindow = await nvim.window;
			const winheight = await nvim.call("winheight", currentWindow.id);
			const cursor = await nvim.call("getpos", ".");
			const renderOpts = await nvim.getVar("mkdp_preview_options");
			const pageTitle = await nvim.getVar("mkdp_page_title");
			const theme = await nvim.getVar("mkdp_theme");
			const name = await buffer.name;
			const content = await buffer.getLines();
			const currentBuffer = await nvim.buffer;
			app.refreshPage({
				bufnr,
				data: {
					options: renderOpts,
					isActive: currentBuffer.id === buffer.id,
					winline,
					winheight,
					cursor,
					pageTitle,
					theme,
					name,
					content
				}
			});
		} else if (method === "close_page") app.closePage({ bufnr });
		else if (method === "open_browser") app.openBrowser({ bufnr });
	});
	nvim.on("request", (method, args, resp) => {
		if (method === "close_all_pages") app.closeAllPages();
		resp.send();
	});
	nvim.channelId.then(async (channelId) => {
		await nvim.setVar("mkdp_node_channel_id", channelId);
	}).catch((e) => {
		log.error("channelId: ", e);
	});
	return {
		nvim,
		init: (param) => {
			app = param;
		}
	};
}
var import_lib, log, app;
var init_attach = __esmMin((() => {
	import_lib = require_lib$4();
	init_logger();
	log = logger("attach");
}));
//#endregion
//#region nvim.js
var require_nvim = /* @__PURE__ */ __commonJSMin(((exports) => {
	var attach = (init_attach(), __toCommonJS(attach_exports)).default;
	var logger = (init_logger(), __toCommonJS(logger_exports)).default("app/nvim");
	var MSG_PREFIX = "[markdown-preview.nvim]";
	var plugin = attach({
		reader: process.stdin,
		writer: process.stdout
	});
	process.on("uncaughtException", function(err) {
		let msg = `${MSG_PREFIX} uncaught exception: ` + err.stack;
		if (plugin.nvim) plugin.nvim.call("mkdp#util#echo_messages", ["Error", msg.split("\n")]);
		logger.error("uncaughtException", err.stack);
	});
	process.on("unhandledRejection", function(reason, p) {
		if (plugin.nvim) plugin.nvim.call("mkdp#util#echo_messages", ["Error", [`${MSG_PREFIX} UnhandledRejection`, `${reason}`]]);
		logger.error("unhandledRejection ", p, reason);
	});
	exports.plugin = plugin;
}));
//#endregion
//#region node_modules/negotiator/lib/charset.js
/**
* negotiator
* Copyright(c) 2012 Isaac Z. Schlueter
* Copyright(c) 2014 Federico Romero
* Copyright(c) 2014-2015 Douglas Christopher Wilson
* MIT Licensed
*/
var require_charset = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Module exports.
	* @public
	*/
	module.exports = preferredCharsets;
	module.exports.preferredCharsets = preferredCharsets;
	/**
	* Module variables.
	* @private
	*/
	var simpleCharsetRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
	/**
	* Parse the Accept-Charset header.
	* @private
	*/
	function parseAcceptCharset(accept) {
		var accepts = accept.split(",");
		for (var i = 0, j = 0; i < accepts.length; i++) {
			var charset = parseCharset(accepts[i].trim(), i);
			if (charset) accepts[j++] = charset;
		}
		accepts.length = j;
		return accepts;
	}
	/**
	* Parse a charset from the Accept-Charset header.
	* @private
	*/
	function parseCharset(str, i) {
		var match = simpleCharsetRegExp.exec(str);
		if (!match) return null;
		var charset = match[1];
		var q = 1;
		if (match[2]) {
			var params = match[2].split(";");
			for (var j = 0; j < params.length; j++) {
				var p = params[j].trim().split("=");
				if (p[0] === "q") {
					q = parseFloat(p[1]);
					break;
				}
			}
		}
		return {
			charset,
			q,
			i
		};
	}
	/**
	* Get the priority of a charset.
	* @private
	*/
	function getCharsetPriority(charset, accepted, index) {
		var priority = {
			o: -1,
			q: 0,
			s: 0
		};
		for (var i = 0; i < accepted.length; i++) {
			var spec = specify(charset, accepted[i], index);
			if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) priority = spec;
		}
		return priority;
	}
	/**
	* Get the specificity of the charset.
	* @private
	*/
	function specify(charset, spec, index) {
		var s = 0;
		if (spec.charset.toLowerCase() === charset.toLowerCase()) s |= 1;
		else if (spec.charset !== "*") return null;
		return {
			i: index,
			o: spec.i,
			q: spec.q,
			s
		};
	}
	/**
	* Get the preferred charsets from an Accept-Charset header.
	* @public
	*/
	function preferredCharsets(accept, provided) {
		var accepts = parseAcceptCharset(accept === void 0 ? "*" : accept || "");
		if (!provided) return accepts.filter(isQuality).sort(compareSpecs).map(getFullCharset);
		var priorities = provided.map(function getPriority(type, index) {
			return getCharsetPriority(type, accepts, index);
		});
		return priorities.filter(isQuality).sort(compareSpecs).map(function getCharset(priority) {
			return provided[priorities.indexOf(priority)];
		});
	}
	/**
	* Compare two specs.
	* @private
	*/
	function compareSpecs(a, b) {
		return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
	}
	/**
	* Get full charset string.
	* @private
	*/
	function getFullCharset(spec) {
		return spec.charset;
	}
	/**
	* Check if a spec has any quality.
	* @private
	*/
	function isQuality(spec) {
		return spec.q > 0;
	}
}));
//#endregion
//#region node_modules/negotiator/lib/encoding.js
/**
* negotiator
* Copyright(c) 2012 Isaac Z. Schlueter
* Copyright(c) 2014 Federico Romero
* Copyright(c) 2014-2015 Douglas Christopher Wilson
* MIT Licensed
*/
var require_encoding = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Module exports.
	* @public
	*/
	module.exports = preferredEncodings;
	module.exports.preferredEncodings = preferredEncodings;
	/**
	* Module variables.
	* @private
	*/
	var simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
	/**
	* Parse the Accept-Encoding header.
	* @private
	*/
	function parseAcceptEncoding(accept) {
		var accepts = accept.split(",");
		var hasIdentity = false;
		var minQuality = 1;
		for (var i = 0, j = 0; i < accepts.length; i++) {
			var encoding = parseEncoding(accepts[i].trim(), i);
			if (encoding) {
				accepts[j++] = encoding;
				hasIdentity = hasIdentity || specify("identity", encoding);
				minQuality = Math.min(minQuality, encoding.q || 1);
			}
		}
		if (!hasIdentity) accepts[j++] = {
			encoding: "identity",
			q: minQuality,
			i
		};
		accepts.length = j;
		return accepts;
	}
	/**
	* Parse an encoding from the Accept-Encoding header.
	* @private
	*/
	function parseEncoding(str, i) {
		var match = simpleEncodingRegExp.exec(str);
		if (!match) return null;
		var encoding = match[1];
		var q = 1;
		if (match[2]) {
			var params = match[2].split(";");
			for (var j = 0; j < params.length; j++) {
				var p = params[j].trim().split("=");
				if (p[0] === "q") {
					q = parseFloat(p[1]);
					break;
				}
			}
		}
		return {
			encoding,
			q,
			i
		};
	}
	/**
	* Get the priority of an encoding.
	* @private
	*/
	function getEncodingPriority(encoding, accepted, index) {
		var priority = {
			o: -1,
			q: 0,
			s: 0
		};
		for (var i = 0; i < accepted.length; i++) {
			var spec = specify(encoding, accepted[i], index);
			if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) priority = spec;
		}
		return priority;
	}
	/**
	* Get the specificity of the encoding.
	* @private
	*/
	function specify(encoding, spec, index) {
		var s = 0;
		if (spec.encoding.toLowerCase() === encoding.toLowerCase()) s |= 1;
		else if (spec.encoding !== "*") return null;
		return {
			i: index,
			o: spec.i,
			q: spec.q,
			s
		};
	}
	/**
	* Get the preferred encodings from an Accept-Encoding header.
	* @public
	*/
	function preferredEncodings(accept, provided) {
		var accepts = parseAcceptEncoding(accept || "");
		if (!provided) return accepts.filter(isQuality).sort(compareSpecs).map(getFullEncoding);
		var priorities = provided.map(function getPriority(type, index) {
			return getEncodingPriority(type, accepts, index);
		});
		return priorities.filter(isQuality).sort(compareSpecs).map(function getEncoding(priority) {
			return provided[priorities.indexOf(priority)];
		});
	}
	/**
	* Compare two specs.
	* @private
	*/
	function compareSpecs(a, b) {
		return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
	}
	/**
	* Get full encoding string.
	* @private
	*/
	function getFullEncoding(spec) {
		return spec.encoding;
	}
	/**
	* Check if a spec has any quality.
	* @private
	*/
	function isQuality(spec) {
		return spec.q > 0;
	}
}));
//#endregion
//#region node_modules/negotiator/lib/language.js
/**
* negotiator
* Copyright(c) 2012 Isaac Z. Schlueter
* Copyright(c) 2014 Federico Romero
* Copyright(c) 2014-2015 Douglas Christopher Wilson
* MIT Licensed
*/
var require_language = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Module exports.
	* @public
	*/
	module.exports = preferredLanguages;
	module.exports.preferredLanguages = preferredLanguages;
	/**
	* Module variables.
	* @private
	*/
	var simpleLanguageRegExp = /^\s*([^\s\-;]+)(?:-([^\s;]+))?\s*(?:;(.*))?$/;
	/**
	* Parse the Accept-Language header.
	* @private
	*/
	function parseAcceptLanguage(accept) {
		var accepts = accept.split(",");
		for (var i = 0, j = 0; i < accepts.length; i++) {
			var language = parseLanguage(accepts[i].trim(), i);
			if (language) accepts[j++] = language;
		}
		accepts.length = j;
		return accepts;
	}
	/**
	* Parse a language from the Accept-Language header.
	* @private
	*/
	function parseLanguage(str, i) {
		var match = simpleLanguageRegExp.exec(str);
		if (!match) return null;
		var prefix = match[1];
		var suffix = match[2];
		var full = prefix;
		if (suffix) full += "-" + suffix;
		var q = 1;
		if (match[3]) {
			var params = match[3].split(";");
			for (var j = 0; j < params.length; j++) {
				var p = params[j].split("=");
				if (p[0] === "q") q = parseFloat(p[1]);
			}
		}
		return {
			prefix,
			suffix,
			q,
			i,
			full
		};
	}
	/**
	* Get the priority of a language.
	* @private
	*/
	function getLanguagePriority(language, accepted, index) {
		var priority = {
			o: -1,
			q: 0,
			s: 0
		};
		for (var i = 0; i < accepted.length; i++) {
			var spec = specify(language, accepted[i], index);
			if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) priority = spec;
		}
		return priority;
	}
	/**
	* Get the specificity of the language.
	* @private
	*/
	function specify(language, spec, index) {
		var p = parseLanguage(language);
		if (!p) return null;
		var s = 0;
		if (spec.full.toLowerCase() === p.full.toLowerCase()) s |= 4;
		else if (spec.prefix.toLowerCase() === p.full.toLowerCase()) s |= 2;
		else if (spec.full.toLowerCase() === p.prefix.toLowerCase()) s |= 1;
		else if (spec.full !== "*") return null;
		return {
			i: index,
			o: spec.i,
			q: spec.q,
			s
		};
	}
	/**
	* Get the preferred languages from an Accept-Language header.
	* @public
	*/
	function preferredLanguages(accept, provided) {
		var accepts = parseAcceptLanguage(accept === void 0 ? "*" : accept || "");
		if (!provided) return accepts.filter(isQuality).sort(compareSpecs).map(getFullLanguage);
		var priorities = provided.map(function getPriority(type, index) {
			return getLanguagePriority(type, accepts, index);
		});
		return priorities.filter(isQuality).sort(compareSpecs).map(function getLanguage(priority) {
			return provided[priorities.indexOf(priority)];
		});
	}
	/**
	* Compare two specs.
	* @private
	*/
	function compareSpecs(a, b) {
		return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
	}
	/**
	* Get full language string.
	* @private
	*/
	function getFullLanguage(spec) {
		return spec.full;
	}
	/**
	* Check if a spec has any quality.
	* @private
	*/
	function isQuality(spec) {
		return spec.q > 0;
	}
}));
//#endregion
//#region node_modules/negotiator/lib/mediaType.js
/**
* negotiator
* Copyright(c) 2012 Isaac Z. Schlueter
* Copyright(c) 2014 Federico Romero
* Copyright(c) 2014-2015 Douglas Christopher Wilson
* MIT Licensed
*/
var require_mediaType = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Module exports.
	* @public
	*/
	module.exports = preferredMediaTypes;
	module.exports.preferredMediaTypes = preferredMediaTypes;
	/**
	* Module variables.
	* @private
	*/
	var simpleMediaTypeRegExp = /^\s*([^\s\/;]+)\/([^;\s]+)\s*(?:;(.*))?$/;
	/**
	* Parse the Accept header.
	* @private
	*/
	function parseAccept(accept) {
		var accepts = splitMediaTypes(accept);
		for (var i = 0, j = 0; i < accepts.length; i++) {
			var mediaType = parseMediaType(accepts[i].trim(), i);
			if (mediaType) accepts[j++] = mediaType;
		}
		accepts.length = j;
		return accepts;
	}
	/**
	* Parse a media type from the Accept header.
	* @private
	*/
	function parseMediaType(str, i) {
		var match = simpleMediaTypeRegExp.exec(str);
		if (!match) return null;
		var params = Object.create(null);
		var q = 1;
		var subtype = match[2];
		var type = match[1];
		if (match[3]) {
			var kvps = splitParameters(match[3]).map(splitKeyValuePair);
			for (var j = 0; j < kvps.length; j++) {
				var pair = kvps[j];
				var key = pair[0].toLowerCase();
				var val = pair[1];
				var value = val && val[0] === "\"" && val[val.length - 1] === "\"" ? val.substr(1, val.length - 2) : val;
				if (key === "q") {
					q = parseFloat(value);
					break;
				}
				params[key] = value;
			}
		}
		return {
			type,
			subtype,
			params,
			q,
			i
		};
	}
	/**
	* Get the priority of a media type.
	* @private
	*/
	function getMediaTypePriority(type, accepted, index) {
		var priority = {
			o: -1,
			q: 0,
			s: 0
		};
		for (var i = 0; i < accepted.length; i++) {
			var spec = specify(type, accepted[i], index);
			if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) priority = spec;
		}
		return priority;
	}
	/**
	* Get the specificity of the media type.
	* @private
	*/
	function specify(type, spec, index) {
		var p = parseMediaType(type);
		var s = 0;
		if (!p) return null;
		if (spec.type.toLowerCase() == p.type.toLowerCase()) s |= 4;
		else if (spec.type != "*") return null;
		if (spec.subtype.toLowerCase() == p.subtype.toLowerCase()) s |= 2;
		else if (spec.subtype != "*") return null;
		var keys = Object.keys(spec.params);
		if (keys.length > 0) {
			if (keys.every(function(k) {
				return spec.params[k] == "*" || (spec.params[k] || "").toLowerCase() == (p.params[k] || "").toLowerCase();
			})) s |= 1;
			else return null;
		}
		return {
			i: index,
			o: spec.i,
			q: spec.q,
			s
		};
	}
	/**
	* Get the preferred media types from an Accept header.
	* @public
	*/
	function preferredMediaTypes(accept, provided) {
		var accepts = parseAccept(accept === void 0 ? "*/*" : accept || "");
		if (!provided) return accepts.filter(isQuality).sort(compareSpecs).map(getFullType);
		var priorities = provided.map(function getPriority(type, index) {
			return getMediaTypePriority(type, accepts, index);
		});
		return priorities.filter(isQuality).sort(compareSpecs).map(function getType(priority) {
			return provided[priorities.indexOf(priority)];
		});
	}
	/**
	* Compare two specs.
	* @private
	*/
	function compareSpecs(a, b) {
		return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0;
	}
	/**
	* Get full type string.
	* @private
	*/
	function getFullType(spec) {
		return spec.type + "/" + spec.subtype;
	}
	/**
	* Check if a spec has any quality.
	* @private
	*/
	function isQuality(spec) {
		return spec.q > 0;
	}
	/**
	* Count the number of quotes in a string.
	* @private
	*/
	function quoteCount(string) {
		var count = 0;
		var index = 0;
		while ((index = string.indexOf("\"", index)) !== -1) {
			count++;
			index++;
		}
		return count;
	}
	/**
	* Split a key value pair.
	* @private
	*/
	function splitKeyValuePair(str) {
		var index = str.indexOf("=");
		var key;
		var val;
		if (index === -1) key = str;
		else {
			key = str.substr(0, index);
			val = str.substr(index + 1);
		}
		return [key, val];
	}
	/**
	* Split an Accept header into media types.
	* @private
	*/
	function splitMediaTypes(accept) {
		var accepts = accept.split(",");
		for (var i = 1, j = 0; i < accepts.length; i++) if (quoteCount(accepts[j]) % 2 == 0) accepts[++j] = accepts[i];
		else accepts[j] += "," + accepts[i];
		accepts.length = j + 1;
		return accepts;
	}
	/**
	* Split a string of parameters.
	* @private
	*/
	function splitParameters(str) {
		var parameters = str.split(";");
		for (var i = 1, j = 0; i < parameters.length; i++) if (quoteCount(parameters[j]) % 2 == 0) parameters[++j] = parameters[i];
		else parameters[j] += ";" + parameters[i];
		parameters.length = j + 1;
		for (var i = 0; i < parameters.length; i++) parameters[i] = parameters[i].trim();
		return parameters;
	}
}));
//#endregion
//#region node_modules/negotiator/index.js
/*!
* negotiator
* Copyright(c) 2012 Federico Romero
* Copyright(c) 2012-2014 Isaac Z. Schlueter
* Copyright(c) 2015 Douglas Christopher Wilson
* MIT Licensed
*/
var require_negotiator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var preferredCharsets = require_charset();
	var preferredEncodings = require_encoding();
	var preferredLanguages = require_language();
	var preferredMediaTypes = require_mediaType();
	/**
	* Module exports.
	* @public
	*/
	module.exports = Negotiator;
	module.exports.Negotiator = Negotiator;
	/**
	* Create a Negotiator instance from a request.
	* @param {object} request
	* @public
	*/
	function Negotiator(request) {
		if (!(this instanceof Negotiator)) return new Negotiator(request);
		this.request = request;
	}
	Negotiator.prototype.charset = function charset(available) {
		var set = this.charsets(available);
		return set && set[0];
	};
	Negotiator.prototype.charsets = function charsets(available) {
		return preferredCharsets(this.request.headers["accept-charset"], available);
	};
	Negotiator.prototype.encoding = function encoding(available) {
		var set = this.encodings(available);
		return set && set[0];
	};
	Negotiator.prototype.encodings = function encodings(available) {
		return preferredEncodings(this.request.headers["accept-encoding"], available);
	};
	Negotiator.prototype.language = function language(available) {
		var set = this.languages(available);
		return set && set[0];
	};
	Negotiator.prototype.languages = function languages(available) {
		return preferredLanguages(this.request.headers["accept-language"], available);
	};
	Negotiator.prototype.mediaType = function mediaType(available) {
		var set = this.mediaTypes(available);
		return set && set[0];
	};
	Negotiator.prototype.mediaTypes = function mediaTypes(available) {
		return preferredMediaTypes(this.request.headers.accept, available);
	};
	Negotiator.prototype.preferredCharset = Negotiator.prototype.charset;
	Negotiator.prototype.preferredCharsets = Negotiator.prototype.charsets;
	Negotiator.prototype.preferredEncoding = Negotiator.prototype.encoding;
	Negotiator.prototype.preferredEncodings = Negotiator.prototype.encodings;
	Negotiator.prototype.preferredLanguage = Negotiator.prototype.language;
	Negotiator.prototype.preferredLanguages = Negotiator.prototype.languages;
	Negotiator.prototype.preferredMediaType = Negotiator.prototype.mediaType;
	Negotiator.prototype.preferredMediaTypes = Negotiator.prototype.mediaTypes;
}));
//#endregion
//#region node_modules/mime-db/db.json
var db_exports = /* @__PURE__ */ __exportAll({ default: () => db_default });
var db_default;
var init_db = __esmMin((() => {
	db_default = {
		"application/1d-interleaved-parityfec": { "source": "iana" },
		"application/3gpdash-qoe-report+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/3gpp-ims+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/3gpphal+json": {
			"source": "iana",
			"compressible": true
		},
		"application/3gpphalforms+json": {
			"source": "iana",
			"compressible": true
		},
		"application/a2l": { "source": "iana" },
		"application/ace+cbor": { "source": "iana" },
		"application/activemessage": { "source": "iana" },
		"application/activity+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-costmap+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-costmapfilter+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-directory+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointcost+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointcostparams+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointprop+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-endpointpropparams+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-error+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-networkmap+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-networkmapfilter+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-updatestreamcontrol+json": {
			"source": "iana",
			"compressible": true
		},
		"application/alto-updatestreamparams+json": {
			"source": "iana",
			"compressible": true
		},
		"application/aml": { "source": "iana" },
		"application/andrew-inset": {
			"source": "iana",
			"extensions": ["ez"]
		},
		"application/applefile": { "source": "iana" },
		"application/applixware": {
			"source": "apache",
			"extensions": ["aw"]
		},
		"application/at+jwt": { "source": "iana" },
		"application/atf": { "source": "iana" },
		"application/atfx": { "source": "iana" },
		"application/atom+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["atom"]
		},
		"application/atomcat+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["atomcat"]
		},
		"application/atomdeleted+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["atomdeleted"]
		},
		"application/atomicmail": { "source": "iana" },
		"application/atomsvc+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["atomsvc"]
		},
		"application/atsc-dwd+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["dwd"]
		},
		"application/atsc-dynamic-event-message": { "source": "iana" },
		"application/atsc-held+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["held"]
		},
		"application/atsc-rdt+json": {
			"source": "iana",
			"compressible": true
		},
		"application/atsc-rsat+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rsat"]
		},
		"application/atxml": { "source": "iana" },
		"application/auth-policy+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/bacnet-xdd+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/batch-smtp": { "source": "iana" },
		"application/bdoc": {
			"compressible": false,
			"extensions": ["bdoc"]
		},
		"application/beep+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/calendar+json": {
			"source": "iana",
			"compressible": true
		},
		"application/calendar+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xcs"]
		},
		"application/call-completion": { "source": "iana" },
		"application/cals-1840": { "source": "iana" },
		"application/captive+json": {
			"source": "iana",
			"compressible": true
		},
		"application/cbor": { "source": "iana" },
		"application/cbor-seq": { "source": "iana" },
		"application/cccex": { "source": "iana" },
		"application/ccmp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/ccxml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ccxml"]
		},
		"application/cdfx+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["cdfx"]
		},
		"application/cdmi-capability": {
			"source": "iana",
			"extensions": ["cdmia"]
		},
		"application/cdmi-container": {
			"source": "iana",
			"extensions": ["cdmic"]
		},
		"application/cdmi-domain": {
			"source": "iana",
			"extensions": ["cdmid"]
		},
		"application/cdmi-object": {
			"source": "iana",
			"extensions": ["cdmio"]
		},
		"application/cdmi-queue": {
			"source": "iana",
			"extensions": ["cdmiq"]
		},
		"application/cdni": { "source": "iana" },
		"application/cea": { "source": "iana" },
		"application/cea-2018+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/cellml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/cfw": { "source": "iana" },
		"application/city+json": {
			"source": "iana",
			"compressible": true
		},
		"application/clr": { "source": "iana" },
		"application/clue+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/clue_info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/cms": { "source": "iana" },
		"application/cnrp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/coap-group+json": {
			"source": "iana",
			"compressible": true
		},
		"application/coap-payload": { "source": "iana" },
		"application/commonground": { "source": "iana" },
		"application/conference-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/cose": { "source": "iana" },
		"application/cose-key": { "source": "iana" },
		"application/cose-key-set": { "source": "iana" },
		"application/cpl+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["cpl"]
		},
		"application/csrattrs": { "source": "iana" },
		"application/csta+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/cstadata+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/csvm+json": {
			"source": "iana",
			"compressible": true
		},
		"application/cu-seeme": {
			"source": "apache",
			"extensions": ["cu"]
		},
		"application/cwt": { "source": "iana" },
		"application/cybercash": { "source": "iana" },
		"application/dart": { "compressible": true },
		"application/dash+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mpd"]
		},
		"application/dash-patch+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mpp"]
		},
		"application/dashdelta": { "source": "iana" },
		"application/davmount+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["davmount"]
		},
		"application/dca-rft": { "source": "iana" },
		"application/dcd": { "source": "iana" },
		"application/dec-dx": { "source": "iana" },
		"application/dialog-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/dicom": { "source": "iana" },
		"application/dicom+json": {
			"source": "iana",
			"compressible": true
		},
		"application/dicom+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/dii": { "source": "iana" },
		"application/dit": { "source": "iana" },
		"application/dns": { "source": "iana" },
		"application/dns+json": {
			"source": "iana",
			"compressible": true
		},
		"application/dns-message": { "source": "iana" },
		"application/docbook+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["dbk"]
		},
		"application/dots+cbor": { "source": "iana" },
		"application/dskpp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/dssc+der": {
			"source": "iana",
			"extensions": ["dssc"]
		},
		"application/dssc+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xdssc"]
		},
		"application/dvcs": { "source": "iana" },
		"application/ecmascript": {
			"source": "iana",
			"compressible": true,
			"extensions": ["es", "ecma"]
		},
		"application/edi-consent": { "source": "iana" },
		"application/edi-x12": {
			"source": "iana",
			"compressible": false
		},
		"application/edifact": {
			"source": "iana",
			"compressible": false
		},
		"application/efi": { "source": "iana" },
		"application/elm+json": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/elm+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.cap+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/emergencycalldata.comment+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.control+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.deviceinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.ecall.msd": { "source": "iana" },
		"application/emergencycalldata.providerinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.serviceinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.subscriberinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emergencycalldata.veds+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/emma+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["emma"]
		},
		"application/emotionml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["emotionml"]
		},
		"application/encaprtp": { "source": "iana" },
		"application/epp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/epub+zip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["epub"]
		},
		"application/eshop": { "source": "iana" },
		"application/exi": {
			"source": "iana",
			"extensions": ["exi"]
		},
		"application/expect-ct-report+json": {
			"source": "iana",
			"compressible": true
		},
		"application/express": {
			"source": "iana",
			"extensions": ["exp"]
		},
		"application/fastinfoset": { "source": "iana" },
		"application/fastsoap": { "source": "iana" },
		"application/fdt+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["fdt"]
		},
		"application/fhir+json": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/fhir+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/fido.trusted-apps+json": { "compressible": true },
		"application/fits": { "source": "iana" },
		"application/flexfec": { "source": "iana" },
		"application/font-sfnt": { "source": "iana" },
		"application/font-tdpfr": {
			"source": "iana",
			"extensions": ["pfr"]
		},
		"application/font-woff": {
			"source": "iana",
			"compressible": false
		},
		"application/framework-attributes+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/geo+json": {
			"source": "iana",
			"compressible": true,
			"extensions": ["geojson"]
		},
		"application/geo+json-seq": { "source": "iana" },
		"application/geopackage+sqlite3": { "source": "iana" },
		"application/geoxacml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/gltf-buffer": { "source": "iana" },
		"application/gml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["gml"]
		},
		"application/gpx+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["gpx"]
		},
		"application/gxf": {
			"source": "apache",
			"extensions": ["gxf"]
		},
		"application/gzip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["gz"]
		},
		"application/h224": { "source": "iana" },
		"application/held+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/hjson": { "extensions": ["hjson"] },
		"application/http": { "source": "iana" },
		"application/hyperstudio": {
			"source": "iana",
			"extensions": ["stk"]
		},
		"application/ibe-key-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/ibe-pkg-reply+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/ibe-pp-data": { "source": "iana" },
		"application/iges": { "source": "iana" },
		"application/im-iscomposing+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/index": { "source": "iana" },
		"application/index.cmd": { "source": "iana" },
		"application/index.obj": { "source": "iana" },
		"application/index.response": { "source": "iana" },
		"application/index.vnd": { "source": "iana" },
		"application/inkml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ink", "inkml"]
		},
		"application/iotp": { "source": "iana" },
		"application/ipfix": {
			"source": "iana",
			"extensions": ["ipfix"]
		},
		"application/ipp": { "source": "iana" },
		"application/isup": { "source": "iana" },
		"application/its+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["its"]
		},
		"application/java-archive": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"jar",
				"war",
				"ear"
			]
		},
		"application/java-serialized-object": {
			"source": "apache",
			"compressible": false,
			"extensions": ["ser"]
		},
		"application/java-vm": {
			"source": "apache",
			"compressible": false,
			"extensions": ["class"]
		},
		"application/javascript": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["js", "mjs"]
		},
		"application/jf2feed+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jose": { "source": "iana" },
		"application/jose+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jrd+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jscalendar+json": {
			"source": "iana",
			"compressible": true
		},
		"application/json": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["json", "map"]
		},
		"application/json-patch+json": {
			"source": "iana",
			"compressible": true
		},
		"application/json-seq": { "source": "iana" },
		"application/json5": { "extensions": ["json5"] },
		"application/jsonml+json": {
			"source": "apache",
			"compressible": true,
			"extensions": ["jsonml"]
		},
		"application/jwk+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jwk-set+json": {
			"source": "iana",
			"compressible": true
		},
		"application/jwt": { "source": "iana" },
		"application/kpml-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/kpml-response+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/ld+json": {
			"source": "iana",
			"compressible": true,
			"extensions": ["jsonld"]
		},
		"application/lgr+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["lgr"]
		},
		"application/link-format": { "source": "iana" },
		"application/load-control+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/lost+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["lostxml"]
		},
		"application/lostsync+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/lpf+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/lxf": { "source": "iana" },
		"application/mac-binhex40": {
			"source": "iana",
			"extensions": ["hqx"]
		},
		"application/mac-compactpro": {
			"source": "apache",
			"extensions": ["cpt"]
		},
		"application/macwriteii": { "source": "iana" },
		"application/mads+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mads"]
		},
		"application/manifest+json": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["webmanifest"]
		},
		"application/marc": {
			"source": "iana",
			"extensions": ["mrc"]
		},
		"application/marcxml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mrcx"]
		},
		"application/mathematica": {
			"source": "iana",
			"extensions": [
				"ma",
				"nb",
				"mb"
			]
		},
		"application/mathml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mathml"]
		},
		"application/mathml-content+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mathml-presentation+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-associated-procedure-description+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-deregister+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-envelope+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-msk+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-msk-response+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-protection-description+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-reception-report+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-register+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-register-response+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-schedule+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbms-user-service-description+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mbox": {
			"source": "iana",
			"extensions": ["mbox"]
		},
		"application/media-policy-dataset+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mpf"]
		},
		"application/media_control+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mediaservercontrol+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mscml"]
		},
		"application/merge-patch+json": {
			"source": "iana",
			"compressible": true
		},
		"application/metalink+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["metalink"]
		},
		"application/metalink4+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["meta4"]
		},
		"application/mets+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mets"]
		},
		"application/mf4": { "source": "iana" },
		"application/mikey": { "source": "iana" },
		"application/mipc": { "source": "iana" },
		"application/missing-blocks+cbor-seq": { "source": "iana" },
		"application/mmt-aei+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["maei"]
		},
		"application/mmt-usd+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["musd"]
		},
		"application/mods+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mods"]
		},
		"application/moss-keys": { "source": "iana" },
		"application/moss-signature": { "source": "iana" },
		"application/mosskey-data": { "source": "iana" },
		"application/mosskey-request": { "source": "iana" },
		"application/mp21": {
			"source": "iana",
			"extensions": ["m21", "mp21"]
		},
		"application/mp4": {
			"source": "iana",
			"extensions": ["mp4s", "m4p"]
		},
		"application/mpeg4-generic": { "source": "iana" },
		"application/mpeg4-iod": { "source": "iana" },
		"application/mpeg4-iod-xmt": { "source": "iana" },
		"application/mrb-consumer+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/mrb-publish+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/msc-ivr+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/msc-mixer+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/msword": {
			"source": "iana",
			"compressible": false,
			"extensions": ["doc", "dot"]
		},
		"application/mud+json": {
			"source": "iana",
			"compressible": true
		},
		"application/multipart-core": { "source": "iana" },
		"application/mxf": {
			"source": "iana",
			"extensions": ["mxf"]
		},
		"application/n-quads": {
			"source": "iana",
			"extensions": ["nq"]
		},
		"application/n-triples": {
			"source": "iana",
			"extensions": ["nt"]
		},
		"application/nasdata": { "source": "iana" },
		"application/news-checkgroups": {
			"source": "iana",
			"charset": "US-ASCII"
		},
		"application/news-groupinfo": {
			"source": "iana",
			"charset": "US-ASCII"
		},
		"application/news-transmission": { "source": "iana" },
		"application/nlsml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/node": {
			"source": "iana",
			"extensions": ["cjs"]
		},
		"application/nss": { "source": "iana" },
		"application/oauth-authz-req+jwt": { "source": "iana" },
		"application/oblivious-dns-message": { "source": "iana" },
		"application/ocsp-request": { "source": "iana" },
		"application/ocsp-response": { "source": "iana" },
		"application/octet-stream": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"bin",
				"dms",
				"lrf",
				"mar",
				"so",
				"dist",
				"distz",
				"pkg",
				"bpk",
				"dump",
				"elc",
				"deploy",
				"exe",
				"dll",
				"deb",
				"dmg",
				"iso",
				"img",
				"msi",
				"msp",
				"msm",
				"buffer"
			]
		},
		"application/oda": {
			"source": "iana",
			"extensions": ["oda"]
		},
		"application/odm+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/odx": { "source": "iana" },
		"application/oebps-package+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["opf"]
		},
		"application/ogg": {
			"source": "iana",
			"compressible": false,
			"extensions": ["ogx"]
		},
		"application/omdoc+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["omdoc"]
		},
		"application/onenote": {
			"source": "apache",
			"extensions": [
				"onetoc",
				"onetoc2",
				"onetmp",
				"onepkg"
			]
		},
		"application/opc-nodeset+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/oscore": { "source": "iana" },
		"application/oxps": {
			"source": "iana",
			"extensions": ["oxps"]
		},
		"application/p21": { "source": "iana" },
		"application/p21+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/p2p-overlay+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["relo"]
		},
		"application/parityfec": { "source": "iana" },
		"application/passport": { "source": "iana" },
		"application/patch-ops-error+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xer"]
		},
		"application/pdf": {
			"source": "iana",
			"compressible": false,
			"extensions": ["pdf"]
		},
		"application/pdx": { "source": "iana" },
		"application/pem-certificate-chain": { "source": "iana" },
		"application/pgp-encrypted": {
			"source": "iana",
			"compressible": false,
			"extensions": ["pgp"]
		},
		"application/pgp-keys": {
			"source": "iana",
			"extensions": ["asc"]
		},
		"application/pgp-signature": {
			"source": "iana",
			"extensions": ["asc", "sig"]
		},
		"application/pics-rules": {
			"source": "apache",
			"extensions": ["prf"]
		},
		"application/pidf+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/pidf-diff+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/pkcs10": {
			"source": "iana",
			"extensions": ["p10"]
		},
		"application/pkcs12": { "source": "iana" },
		"application/pkcs7-mime": {
			"source": "iana",
			"extensions": ["p7m", "p7c"]
		},
		"application/pkcs7-signature": {
			"source": "iana",
			"extensions": ["p7s"]
		},
		"application/pkcs8": {
			"source": "iana",
			"extensions": ["p8"]
		},
		"application/pkcs8-encrypted": { "source": "iana" },
		"application/pkix-attr-cert": {
			"source": "iana",
			"extensions": ["ac"]
		},
		"application/pkix-cert": {
			"source": "iana",
			"extensions": ["cer"]
		},
		"application/pkix-crl": {
			"source": "iana",
			"extensions": ["crl"]
		},
		"application/pkix-pkipath": {
			"source": "iana",
			"extensions": ["pkipath"]
		},
		"application/pkixcmp": {
			"source": "iana",
			"extensions": ["pki"]
		},
		"application/pls+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["pls"]
		},
		"application/poc-settings+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/postscript": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"ai",
				"eps",
				"ps"
			]
		},
		"application/ppsp-tracker+json": {
			"source": "iana",
			"compressible": true
		},
		"application/problem+json": {
			"source": "iana",
			"compressible": true
		},
		"application/problem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/provenance+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["provx"]
		},
		"application/prs.alvestrand.titrax-sheet": { "source": "iana" },
		"application/prs.cww": {
			"source": "iana",
			"extensions": ["cww"]
		},
		"application/prs.cyn": {
			"source": "iana",
			"charset": "7-BIT"
		},
		"application/prs.hpub+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/prs.nprend": { "source": "iana" },
		"application/prs.plucker": { "source": "iana" },
		"application/prs.rdf-xml-crypt": { "source": "iana" },
		"application/prs.xsf+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/pskc+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["pskcxml"]
		},
		"application/pvd+json": {
			"source": "iana",
			"compressible": true
		},
		"application/qsig": { "source": "iana" },
		"application/raml+yaml": {
			"compressible": true,
			"extensions": ["raml"]
		},
		"application/raptorfec": { "source": "iana" },
		"application/rdap+json": {
			"source": "iana",
			"compressible": true
		},
		"application/rdf+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rdf", "owl"]
		},
		"application/reginfo+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rif"]
		},
		"application/relax-ng-compact-syntax": {
			"source": "iana",
			"extensions": ["rnc"]
		},
		"application/remote-printing": { "source": "iana" },
		"application/reputon+json": {
			"source": "iana",
			"compressible": true
		},
		"application/resource-lists+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rl"]
		},
		"application/resource-lists-diff+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rld"]
		},
		"application/rfc+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/riscos": { "source": "iana" },
		"application/rlmi+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/rls-services+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rs"]
		},
		"application/route-apd+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rapd"]
		},
		"application/route-s-tsid+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["sls"]
		},
		"application/route-usd+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rusd"]
		},
		"application/rpki-ghostbusters": {
			"source": "iana",
			"extensions": ["gbr"]
		},
		"application/rpki-manifest": {
			"source": "iana",
			"extensions": ["mft"]
		},
		"application/rpki-publication": { "source": "iana" },
		"application/rpki-roa": {
			"source": "iana",
			"extensions": ["roa"]
		},
		"application/rpki-updown": { "source": "iana" },
		"application/rsd+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["rsd"]
		},
		"application/rss+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["rss"]
		},
		"application/rtf": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rtf"]
		},
		"application/rtploopback": { "source": "iana" },
		"application/rtx": { "source": "iana" },
		"application/samlassertion+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/samlmetadata+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/sarif+json": {
			"source": "iana",
			"compressible": true
		},
		"application/sarif-external-properties+json": {
			"source": "iana",
			"compressible": true
		},
		"application/sbe": { "source": "iana" },
		"application/sbml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["sbml"]
		},
		"application/scaip+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/scim+json": {
			"source": "iana",
			"compressible": true
		},
		"application/scvp-cv-request": {
			"source": "iana",
			"extensions": ["scq"]
		},
		"application/scvp-cv-response": {
			"source": "iana",
			"extensions": ["scs"]
		},
		"application/scvp-vp-request": {
			"source": "iana",
			"extensions": ["spq"]
		},
		"application/scvp-vp-response": {
			"source": "iana",
			"extensions": ["spp"]
		},
		"application/sdp": {
			"source": "iana",
			"extensions": ["sdp"]
		},
		"application/secevent+jwt": { "source": "iana" },
		"application/senml+cbor": { "source": "iana" },
		"application/senml+json": {
			"source": "iana",
			"compressible": true
		},
		"application/senml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["senmlx"]
		},
		"application/senml-etch+cbor": { "source": "iana" },
		"application/senml-etch+json": {
			"source": "iana",
			"compressible": true
		},
		"application/senml-exi": { "source": "iana" },
		"application/sensml+cbor": { "source": "iana" },
		"application/sensml+json": {
			"source": "iana",
			"compressible": true
		},
		"application/sensml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["sensmlx"]
		},
		"application/sensml-exi": { "source": "iana" },
		"application/sep+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/sep-exi": { "source": "iana" },
		"application/session-info": { "source": "iana" },
		"application/set-payment": { "source": "iana" },
		"application/set-payment-initiation": {
			"source": "iana",
			"extensions": ["setpay"]
		},
		"application/set-registration": { "source": "iana" },
		"application/set-registration-initiation": {
			"source": "iana",
			"extensions": ["setreg"]
		},
		"application/sgml": { "source": "iana" },
		"application/sgml-open-catalog": { "source": "iana" },
		"application/shf+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["shf"]
		},
		"application/sieve": {
			"source": "iana",
			"extensions": ["siv", "sieve"]
		},
		"application/simple-filter+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/simple-message-summary": { "source": "iana" },
		"application/simplesymbolcontainer": { "source": "iana" },
		"application/sipc": { "source": "iana" },
		"application/slate": { "source": "iana" },
		"application/smil": { "source": "iana" },
		"application/smil+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["smi", "smil"]
		},
		"application/smpte336m": { "source": "iana" },
		"application/soap+fastinfoset": { "source": "iana" },
		"application/soap+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/sparql-query": {
			"source": "iana",
			"extensions": ["rq"]
		},
		"application/sparql-results+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["srx"]
		},
		"application/spdx+json": {
			"source": "iana",
			"compressible": true
		},
		"application/spirits-event+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/sql": { "source": "iana" },
		"application/srgs": {
			"source": "iana",
			"extensions": ["gram"]
		},
		"application/srgs+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["grxml"]
		},
		"application/sru+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["sru"]
		},
		"application/ssdl+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["ssdl"]
		},
		"application/ssml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ssml"]
		},
		"application/stix+json": {
			"source": "iana",
			"compressible": true
		},
		"application/swid+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["swidtag"]
		},
		"application/tamp-apex-update": { "source": "iana" },
		"application/tamp-apex-update-confirm": { "source": "iana" },
		"application/tamp-community-update": { "source": "iana" },
		"application/tamp-community-update-confirm": { "source": "iana" },
		"application/tamp-error": { "source": "iana" },
		"application/tamp-sequence-adjust": { "source": "iana" },
		"application/tamp-sequence-adjust-confirm": { "source": "iana" },
		"application/tamp-status-query": { "source": "iana" },
		"application/tamp-status-response": { "source": "iana" },
		"application/tamp-update": { "source": "iana" },
		"application/tamp-update-confirm": { "source": "iana" },
		"application/tar": { "compressible": true },
		"application/taxii+json": {
			"source": "iana",
			"compressible": true
		},
		"application/td+json": {
			"source": "iana",
			"compressible": true
		},
		"application/tei+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["tei", "teicorpus"]
		},
		"application/tetra_isi": { "source": "iana" },
		"application/thraud+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["tfi"]
		},
		"application/timestamp-query": { "source": "iana" },
		"application/timestamp-reply": { "source": "iana" },
		"application/timestamped-data": {
			"source": "iana",
			"extensions": ["tsd"]
		},
		"application/tlsrpt+gzip": { "source": "iana" },
		"application/tlsrpt+json": {
			"source": "iana",
			"compressible": true
		},
		"application/tnauthlist": { "source": "iana" },
		"application/token-introspection+jwt": { "source": "iana" },
		"application/toml": {
			"compressible": true,
			"extensions": ["toml"]
		},
		"application/trickle-ice-sdpfrag": { "source": "iana" },
		"application/trig": {
			"source": "iana",
			"extensions": ["trig"]
		},
		"application/ttml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ttml"]
		},
		"application/tve-trigger": { "source": "iana" },
		"application/tzif": { "source": "iana" },
		"application/tzif-leap": { "source": "iana" },
		"application/ubjson": {
			"compressible": false,
			"extensions": ["ubj"]
		},
		"application/ulpfec": { "source": "iana" },
		"application/urc-grpsheet+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/urc-ressheet+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rsheet"]
		},
		"application/urc-targetdesc+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["td"]
		},
		"application/urc-uisocketdesc+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vcard+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vcard+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vemmi": { "source": "iana" },
		"application/vividence.scriptfile": { "source": "apache" },
		"application/vnd.1000minds.decision-model+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["1km"]
		},
		"application/vnd.3gpp-prose+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp-prose-pc3ch+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp-v2x-local-service-information": { "source": "iana" },
		"application/vnd.3gpp.5gnas": { "source": "iana" },
		"application/vnd.3gpp.access-transfer-events+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.bsf+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.gmop+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.gtpc": { "source": "iana" },
		"application/vnd.3gpp.interworking-data": { "source": "iana" },
		"application/vnd.3gpp.lpp": { "source": "iana" },
		"application/vnd.3gpp.mc-signalling-ear": { "source": "iana" },
		"application/vnd.3gpp.mcdata-affiliation-command+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcdata-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcdata-payload": { "source": "iana" },
		"application/vnd.3gpp.mcdata-service-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcdata-signalling": { "source": "iana" },
		"application/vnd.3gpp.mcdata-ue-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcdata-user-profile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-affiliation-command+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-floor-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-location-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-service-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-signed+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-ue-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-ue-init-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcptt-user-profile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-affiliation-command+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-affiliation-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-location-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-service-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-transmission-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-ue-config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mcvideo-user-profile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.mid-call+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.ngap": { "source": "iana" },
		"application/vnd.3gpp.pfcp": { "source": "iana" },
		"application/vnd.3gpp.pic-bw-large": {
			"source": "iana",
			"extensions": ["plb"]
		},
		"application/vnd.3gpp.pic-bw-small": {
			"source": "iana",
			"extensions": ["psb"]
		},
		"application/vnd.3gpp.pic-bw-var": {
			"source": "iana",
			"extensions": ["pvb"]
		},
		"application/vnd.3gpp.s1ap": { "source": "iana" },
		"application/vnd.3gpp.sms": { "source": "iana" },
		"application/vnd.3gpp.sms+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.srvcc-ext+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.srvcc-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.state-and-event-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp.ussd+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp2.bcmcsinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.3gpp2.sms": { "source": "iana" },
		"application/vnd.3gpp2.tcap": {
			"source": "iana",
			"extensions": ["tcap"]
		},
		"application/vnd.3lightssoftware.imagescal": { "source": "iana" },
		"application/vnd.3m.post-it-notes": {
			"source": "iana",
			"extensions": ["pwn"]
		},
		"application/vnd.accpac.simply.aso": {
			"source": "iana",
			"extensions": ["aso"]
		},
		"application/vnd.accpac.simply.imp": {
			"source": "iana",
			"extensions": ["imp"]
		},
		"application/vnd.acucobol": {
			"source": "iana",
			"extensions": ["acu"]
		},
		"application/vnd.acucorp": {
			"source": "iana",
			"extensions": ["atc", "acutc"]
		},
		"application/vnd.adobe.air-application-installer-package+zip": {
			"source": "apache",
			"compressible": false,
			"extensions": ["air"]
		},
		"application/vnd.adobe.flash.movie": { "source": "iana" },
		"application/vnd.adobe.formscentral.fcdt": {
			"source": "iana",
			"extensions": ["fcdt"]
		},
		"application/vnd.adobe.fxp": {
			"source": "iana",
			"extensions": ["fxp", "fxpl"]
		},
		"application/vnd.adobe.partial-upload": { "source": "iana" },
		"application/vnd.adobe.xdp+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xdp"]
		},
		"application/vnd.adobe.xfdf": {
			"source": "iana",
			"extensions": ["xfdf"]
		},
		"application/vnd.aether.imp": { "source": "iana" },
		"application/vnd.afpc.afplinedata": { "source": "iana" },
		"application/vnd.afpc.afplinedata-pagedef": { "source": "iana" },
		"application/vnd.afpc.cmoca-cmresource": { "source": "iana" },
		"application/vnd.afpc.foca-charset": { "source": "iana" },
		"application/vnd.afpc.foca-codedfont": { "source": "iana" },
		"application/vnd.afpc.foca-codepage": { "source": "iana" },
		"application/vnd.afpc.modca": { "source": "iana" },
		"application/vnd.afpc.modca-cmtable": { "source": "iana" },
		"application/vnd.afpc.modca-formdef": { "source": "iana" },
		"application/vnd.afpc.modca-mediummap": { "source": "iana" },
		"application/vnd.afpc.modca-objectcontainer": { "source": "iana" },
		"application/vnd.afpc.modca-overlay": { "source": "iana" },
		"application/vnd.afpc.modca-pagesegment": { "source": "iana" },
		"application/vnd.age": {
			"source": "iana",
			"extensions": ["age"]
		},
		"application/vnd.ah-barcode": { "source": "iana" },
		"application/vnd.ahead.space": {
			"source": "iana",
			"extensions": ["ahead"]
		},
		"application/vnd.airzip.filesecure.azf": {
			"source": "iana",
			"extensions": ["azf"]
		},
		"application/vnd.airzip.filesecure.azs": {
			"source": "iana",
			"extensions": ["azs"]
		},
		"application/vnd.amadeus+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.amazon.ebook": {
			"source": "apache",
			"extensions": ["azw"]
		},
		"application/vnd.amazon.mobi8-ebook": { "source": "iana" },
		"application/vnd.americandynamics.acc": {
			"source": "iana",
			"extensions": ["acc"]
		},
		"application/vnd.amiga.ami": {
			"source": "iana",
			"extensions": ["ami"]
		},
		"application/vnd.amundsen.maze+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.android.ota": { "source": "iana" },
		"application/vnd.android.package-archive": {
			"source": "apache",
			"compressible": false,
			"extensions": ["apk"]
		},
		"application/vnd.anki": { "source": "iana" },
		"application/vnd.anser-web-certificate-issue-initiation": {
			"source": "iana",
			"extensions": ["cii"]
		},
		"application/vnd.anser-web-funds-transfer-initiation": {
			"source": "apache",
			"extensions": ["fti"]
		},
		"application/vnd.antix.game-component": {
			"source": "iana",
			"extensions": ["atx"]
		},
		"application/vnd.apache.arrow.file": { "source": "iana" },
		"application/vnd.apache.arrow.stream": { "source": "iana" },
		"application/vnd.apache.thrift.binary": { "source": "iana" },
		"application/vnd.apache.thrift.compact": { "source": "iana" },
		"application/vnd.apache.thrift.json": { "source": "iana" },
		"application/vnd.api+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.aplextor.warrp+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.apothekende.reservation+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.apple.installer+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["mpkg"]
		},
		"application/vnd.apple.keynote": {
			"source": "iana",
			"extensions": ["key"]
		},
		"application/vnd.apple.mpegurl": {
			"source": "iana",
			"extensions": ["m3u8"]
		},
		"application/vnd.apple.numbers": {
			"source": "iana",
			"extensions": ["numbers"]
		},
		"application/vnd.apple.pages": {
			"source": "iana",
			"extensions": ["pages"]
		},
		"application/vnd.apple.pkpass": {
			"compressible": false,
			"extensions": ["pkpass"]
		},
		"application/vnd.arastra.swi": { "source": "iana" },
		"application/vnd.aristanetworks.swi": {
			"source": "iana",
			"extensions": ["swi"]
		},
		"application/vnd.artisan+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.artsquare": { "source": "iana" },
		"application/vnd.astraea-software.iota": {
			"source": "iana",
			"extensions": ["iota"]
		},
		"application/vnd.audiograph": {
			"source": "iana",
			"extensions": ["aep"]
		},
		"application/vnd.autopackage": { "source": "iana" },
		"application/vnd.avalon+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.avistar+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.balsamiq.bmml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["bmml"]
		},
		"application/vnd.balsamiq.bmpr": { "source": "iana" },
		"application/vnd.banana-accounting": { "source": "iana" },
		"application/vnd.bbf.usp.error": { "source": "iana" },
		"application/vnd.bbf.usp.msg": { "source": "iana" },
		"application/vnd.bbf.usp.msg+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.bekitzur-stech+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.bint.med-content": { "source": "iana" },
		"application/vnd.biopax.rdf+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.blink-idb-value-wrapper": { "source": "iana" },
		"application/vnd.blueice.multipass": {
			"source": "iana",
			"extensions": ["mpm"]
		},
		"application/vnd.bluetooth.ep.oob": { "source": "iana" },
		"application/vnd.bluetooth.le.oob": { "source": "iana" },
		"application/vnd.bmi": {
			"source": "iana",
			"extensions": ["bmi"]
		},
		"application/vnd.bpf": { "source": "iana" },
		"application/vnd.bpf3": { "source": "iana" },
		"application/vnd.businessobjects": {
			"source": "iana",
			"extensions": ["rep"]
		},
		"application/vnd.byu.uapi+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cab-jscript": { "source": "iana" },
		"application/vnd.canon-cpdl": { "source": "iana" },
		"application/vnd.canon-lips": { "source": "iana" },
		"application/vnd.capasystems-pg+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cendio.thinlinc.clientconf": { "source": "iana" },
		"application/vnd.century-systems.tcp_stream": { "source": "iana" },
		"application/vnd.chemdraw+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["cdxml"]
		},
		"application/vnd.chess-pgn": { "source": "iana" },
		"application/vnd.chipnuts.karaoke-mmd": {
			"source": "iana",
			"extensions": ["mmd"]
		},
		"application/vnd.ciedi": { "source": "iana" },
		"application/vnd.cinderella": {
			"source": "iana",
			"extensions": ["cdy"]
		},
		"application/vnd.cirpack.isdn-ext": { "source": "iana" },
		"application/vnd.citationstyles.style+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["csl"]
		},
		"application/vnd.claymore": {
			"source": "iana",
			"extensions": ["cla"]
		},
		"application/vnd.cloanto.rp9": {
			"source": "iana",
			"extensions": ["rp9"]
		},
		"application/vnd.clonk.c4group": {
			"source": "iana",
			"extensions": [
				"c4g",
				"c4d",
				"c4f",
				"c4p",
				"c4u"
			]
		},
		"application/vnd.cluetrust.cartomobile-config": {
			"source": "iana",
			"extensions": ["c11amc"]
		},
		"application/vnd.cluetrust.cartomobile-config-pkg": {
			"source": "iana",
			"extensions": ["c11amz"]
		},
		"application/vnd.coffeescript": { "source": "iana" },
		"application/vnd.collabio.xodocuments.document": { "source": "iana" },
		"application/vnd.collabio.xodocuments.document-template": { "source": "iana" },
		"application/vnd.collabio.xodocuments.presentation": { "source": "iana" },
		"application/vnd.collabio.xodocuments.presentation-template": { "source": "iana" },
		"application/vnd.collabio.xodocuments.spreadsheet": { "source": "iana" },
		"application/vnd.collabio.xodocuments.spreadsheet-template": { "source": "iana" },
		"application/vnd.collection+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.collection.doc+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.collection.next+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.comicbook+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.comicbook-rar": { "source": "iana" },
		"application/vnd.commerce-battelle": { "source": "iana" },
		"application/vnd.commonspace": {
			"source": "iana",
			"extensions": ["csp"]
		},
		"application/vnd.contact.cmsg": {
			"source": "iana",
			"extensions": ["cdbcmsg"]
		},
		"application/vnd.coreos.ignition+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cosmocaller": {
			"source": "iana",
			"extensions": ["cmc"]
		},
		"application/vnd.crick.clicker": {
			"source": "iana",
			"extensions": ["clkx"]
		},
		"application/vnd.crick.clicker.keyboard": {
			"source": "iana",
			"extensions": ["clkk"]
		},
		"application/vnd.crick.clicker.palette": {
			"source": "iana",
			"extensions": ["clkp"]
		},
		"application/vnd.crick.clicker.template": {
			"source": "iana",
			"extensions": ["clkt"]
		},
		"application/vnd.crick.clicker.wordbank": {
			"source": "iana",
			"extensions": ["clkw"]
		},
		"application/vnd.criticaltools.wbs+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wbs"]
		},
		"application/vnd.cryptii.pipe+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.crypto-shade-file": { "source": "iana" },
		"application/vnd.cryptomator.encrypted": { "source": "iana" },
		"application/vnd.cryptomator.vault": { "source": "iana" },
		"application/vnd.ctc-posml": {
			"source": "iana",
			"extensions": ["pml"]
		},
		"application/vnd.ctct.ws+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cups-pdf": { "source": "iana" },
		"application/vnd.cups-postscript": { "source": "iana" },
		"application/vnd.cups-ppd": {
			"source": "iana",
			"extensions": ["ppd"]
		},
		"application/vnd.cups-raster": { "source": "iana" },
		"application/vnd.cups-raw": { "source": "iana" },
		"application/vnd.curl": { "source": "iana" },
		"application/vnd.curl.car": {
			"source": "apache",
			"extensions": ["car"]
		},
		"application/vnd.curl.pcurl": {
			"source": "apache",
			"extensions": ["pcurl"]
		},
		"application/vnd.cyan.dean.root+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cybank": { "source": "iana" },
		"application/vnd.cyclonedx+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.cyclonedx+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.d2l.coursepackage1p0+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.d3m-dataset": { "source": "iana" },
		"application/vnd.d3m-problem": { "source": "iana" },
		"application/vnd.dart": {
			"source": "iana",
			"compressible": true,
			"extensions": ["dart"]
		},
		"application/vnd.data-vision.rdz": {
			"source": "iana",
			"extensions": ["rdz"]
		},
		"application/vnd.datapackage+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dataresource+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dbf": {
			"source": "iana",
			"extensions": ["dbf"]
		},
		"application/vnd.debian.binary-package": { "source": "iana" },
		"application/vnd.dece.data": {
			"source": "iana",
			"extensions": [
				"uvf",
				"uvvf",
				"uvd",
				"uvvd"
			]
		},
		"application/vnd.dece.ttml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["uvt", "uvvt"]
		},
		"application/vnd.dece.unspecified": {
			"source": "iana",
			"extensions": ["uvx", "uvvx"]
		},
		"application/vnd.dece.zip": {
			"source": "iana",
			"extensions": ["uvz", "uvvz"]
		},
		"application/vnd.denovo.fcselayout-link": {
			"source": "iana",
			"extensions": ["fe_launch"]
		},
		"application/vnd.desmume.movie": { "source": "iana" },
		"application/vnd.dir-bi.plate-dl-nosuffix": { "source": "iana" },
		"application/vnd.dm.delegation+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dna": {
			"source": "iana",
			"extensions": ["dna"]
		},
		"application/vnd.document+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dolby.mlp": {
			"source": "apache",
			"extensions": ["mlp"]
		},
		"application/vnd.dolby.mobile.1": { "source": "iana" },
		"application/vnd.dolby.mobile.2": { "source": "iana" },
		"application/vnd.doremir.scorecloud-binary-document": { "source": "iana" },
		"application/vnd.dpgraph": {
			"source": "iana",
			"extensions": ["dpg"]
		},
		"application/vnd.dreamfactory": {
			"source": "iana",
			"extensions": ["dfac"]
		},
		"application/vnd.drive+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ds-keypoint": {
			"source": "apache",
			"extensions": ["kpxx"]
		},
		"application/vnd.dtg.local": { "source": "iana" },
		"application/vnd.dtg.local.flash": { "source": "iana" },
		"application/vnd.dtg.local.html": { "source": "iana" },
		"application/vnd.dvb.ait": {
			"source": "iana",
			"extensions": ["ait"]
		},
		"application/vnd.dvb.dvbisl+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.dvbj": { "source": "iana" },
		"application/vnd.dvb.esgcontainer": { "source": "iana" },
		"application/vnd.dvb.ipdcdftnotifaccess": { "source": "iana" },
		"application/vnd.dvb.ipdcesgaccess": { "source": "iana" },
		"application/vnd.dvb.ipdcesgaccess2": { "source": "iana" },
		"application/vnd.dvb.ipdcesgpdd": { "source": "iana" },
		"application/vnd.dvb.ipdcroaming": { "source": "iana" },
		"application/vnd.dvb.iptv.alfec-base": { "source": "iana" },
		"application/vnd.dvb.iptv.alfec-enhancement": { "source": "iana" },
		"application/vnd.dvb.notif-aggregate-root+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-container+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-generic+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-ia-msglist+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-ia-registration-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-ia-registration-response+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.notif-init+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.dvb.pfr": { "source": "iana" },
		"application/vnd.dvb.service": {
			"source": "iana",
			"extensions": ["svc"]
		},
		"application/vnd.dxr": { "source": "iana" },
		"application/vnd.dynageo": {
			"source": "iana",
			"extensions": ["geo"]
		},
		"application/vnd.dzr": { "source": "iana" },
		"application/vnd.easykaraoke.cdgdownload": { "source": "iana" },
		"application/vnd.ecdis-update": { "source": "iana" },
		"application/vnd.ecip.rlp": { "source": "iana" },
		"application/vnd.eclipse.ditto+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ecowin.chart": {
			"source": "iana",
			"extensions": ["mag"]
		},
		"application/vnd.ecowin.filerequest": { "source": "iana" },
		"application/vnd.ecowin.fileupdate": { "source": "iana" },
		"application/vnd.ecowin.series": { "source": "iana" },
		"application/vnd.ecowin.seriesrequest": { "source": "iana" },
		"application/vnd.ecowin.seriesupdate": { "source": "iana" },
		"application/vnd.efi.img": { "source": "iana" },
		"application/vnd.efi.iso": { "source": "iana" },
		"application/vnd.emclient.accessrequest+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.enliven": {
			"source": "iana",
			"extensions": ["nml"]
		},
		"application/vnd.enphase.envoy": { "source": "iana" },
		"application/vnd.eprints.data+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.epson.esf": {
			"source": "iana",
			"extensions": ["esf"]
		},
		"application/vnd.epson.msf": {
			"source": "iana",
			"extensions": ["msf"]
		},
		"application/vnd.epson.quickanime": {
			"source": "iana",
			"extensions": ["qam"]
		},
		"application/vnd.epson.salt": {
			"source": "iana",
			"extensions": ["slt"]
		},
		"application/vnd.epson.ssf": {
			"source": "iana",
			"extensions": ["ssf"]
		},
		"application/vnd.ericsson.quickcall": { "source": "iana" },
		"application/vnd.espass-espass+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.eszigno3+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["es3", "et3"]
		},
		"application/vnd.etsi.aoc+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.asic-e+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.etsi.asic-s+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.etsi.cug+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvcommand+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvdiscovery+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvprofile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvsad-bc+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvsad-cod+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvsad-npvr+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvservice+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvsync+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.iptvueprofile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.mcid+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.mheg5": { "source": "iana" },
		"application/vnd.etsi.overload-control-policy-dataset+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.pstn+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.sci+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.simservs+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.timestamp-token": { "source": "iana" },
		"application/vnd.etsi.tsl+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.etsi.tsl.der": { "source": "iana" },
		"application/vnd.eu.kasparian.car+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.eudora.data": { "source": "iana" },
		"application/vnd.evolv.ecig.profile": { "source": "iana" },
		"application/vnd.evolv.ecig.settings": { "source": "iana" },
		"application/vnd.evolv.ecig.theme": { "source": "iana" },
		"application/vnd.exstream-empower+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.exstream-package": { "source": "iana" },
		"application/vnd.ezpix-album": {
			"source": "iana",
			"extensions": ["ez2"]
		},
		"application/vnd.ezpix-package": {
			"source": "iana",
			"extensions": ["ez3"]
		},
		"application/vnd.f-secure.mobile": { "source": "iana" },
		"application/vnd.familysearch.gedcom+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.fastcopy-disk-image": { "source": "iana" },
		"application/vnd.fdf": {
			"source": "iana",
			"extensions": ["fdf"]
		},
		"application/vnd.fdsn.mseed": {
			"source": "iana",
			"extensions": ["mseed"]
		},
		"application/vnd.fdsn.seed": {
			"source": "iana",
			"extensions": ["seed", "dataless"]
		},
		"application/vnd.ffsns": { "source": "iana" },
		"application/vnd.ficlab.flb+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.filmit.zfc": { "source": "iana" },
		"application/vnd.fints": { "source": "iana" },
		"application/vnd.firemonkeys.cloudcell": { "source": "iana" },
		"application/vnd.flographit": {
			"source": "iana",
			"extensions": ["gph"]
		},
		"application/vnd.fluxtime.clip": {
			"source": "iana",
			"extensions": ["ftc"]
		},
		"application/vnd.font-fontforge-sfd": { "source": "iana" },
		"application/vnd.framemaker": {
			"source": "iana",
			"extensions": [
				"fm",
				"frame",
				"maker",
				"book"
			]
		},
		"application/vnd.frogans.fnc": {
			"source": "iana",
			"extensions": ["fnc"]
		},
		"application/vnd.frogans.ltf": {
			"source": "iana",
			"extensions": ["ltf"]
		},
		"application/vnd.fsc.weblaunch": {
			"source": "iana",
			"extensions": ["fsc"]
		},
		"application/vnd.fujifilm.fb.docuworks": { "source": "iana" },
		"application/vnd.fujifilm.fb.docuworks.binder": { "source": "iana" },
		"application/vnd.fujifilm.fb.docuworks.container": { "source": "iana" },
		"application/vnd.fujifilm.fb.jfi+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.fujitsu.oasys": {
			"source": "iana",
			"extensions": ["oas"]
		},
		"application/vnd.fujitsu.oasys2": {
			"source": "iana",
			"extensions": ["oa2"]
		},
		"application/vnd.fujitsu.oasys3": {
			"source": "iana",
			"extensions": ["oa3"]
		},
		"application/vnd.fujitsu.oasysgp": {
			"source": "iana",
			"extensions": ["fg5"]
		},
		"application/vnd.fujitsu.oasysprs": {
			"source": "iana",
			"extensions": ["bh2"]
		},
		"application/vnd.fujixerox.art-ex": { "source": "iana" },
		"application/vnd.fujixerox.art4": { "source": "iana" },
		"application/vnd.fujixerox.ddd": {
			"source": "iana",
			"extensions": ["ddd"]
		},
		"application/vnd.fujixerox.docuworks": {
			"source": "iana",
			"extensions": ["xdw"]
		},
		"application/vnd.fujixerox.docuworks.binder": {
			"source": "iana",
			"extensions": ["xbd"]
		},
		"application/vnd.fujixerox.docuworks.container": { "source": "iana" },
		"application/vnd.fujixerox.hbpl": { "source": "iana" },
		"application/vnd.fut-misnet": { "source": "iana" },
		"application/vnd.futoin+cbor": { "source": "iana" },
		"application/vnd.futoin+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.fuzzysheet": {
			"source": "iana",
			"extensions": ["fzs"]
		},
		"application/vnd.genomatix.tuxedo": {
			"source": "iana",
			"extensions": ["txd"]
		},
		"application/vnd.gentics.grd+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.geo+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.geocube+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.geogebra.file": {
			"source": "iana",
			"extensions": ["ggb"]
		},
		"application/vnd.geogebra.slides": { "source": "iana" },
		"application/vnd.geogebra.tool": {
			"source": "iana",
			"extensions": ["ggt"]
		},
		"application/vnd.geometry-explorer": {
			"source": "iana",
			"extensions": ["gex", "gre"]
		},
		"application/vnd.geonext": {
			"source": "iana",
			"extensions": ["gxt"]
		},
		"application/vnd.geoplan": {
			"source": "iana",
			"extensions": ["g2w"]
		},
		"application/vnd.geospace": {
			"source": "iana",
			"extensions": ["g3w"]
		},
		"application/vnd.gerber": { "source": "iana" },
		"application/vnd.globalplatform.card-content-mgt": { "source": "iana" },
		"application/vnd.globalplatform.card-content-mgt-response": { "source": "iana" },
		"application/vnd.gmx": {
			"source": "iana",
			"extensions": ["gmx"]
		},
		"application/vnd.google-apps.document": {
			"compressible": false,
			"extensions": ["gdoc"]
		},
		"application/vnd.google-apps.presentation": {
			"compressible": false,
			"extensions": ["gslides"]
		},
		"application/vnd.google-apps.spreadsheet": {
			"compressible": false,
			"extensions": ["gsheet"]
		},
		"application/vnd.google-earth.kml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["kml"]
		},
		"application/vnd.google-earth.kmz": {
			"source": "iana",
			"compressible": false,
			"extensions": ["kmz"]
		},
		"application/vnd.gov.sk.e-form+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.gov.sk.e-form+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.gov.sk.xmldatacontainer+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.grafeq": {
			"source": "iana",
			"extensions": ["gqf", "gqs"]
		},
		"application/vnd.gridmp": { "source": "iana" },
		"application/vnd.groove-account": {
			"source": "iana",
			"extensions": ["gac"]
		},
		"application/vnd.groove-help": {
			"source": "iana",
			"extensions": ["ghf"]
		},
		"application/vnd.groove-identity-message": {
			"source": "iana",
			"extensions": ["gim"]
		},
		"application/vnd.groove-injector": {
			"source": "iana",
			"extensions": ["grv"]
		},
		"application/vnd.groove-tool-message": {
			"source": "iana",
			"extensions": ["gtm"]
		},
		"application/vnd.groove-tool-template": {
			"source": "iana",
			"extensions": ["tpl"]
		},
		"application/vnd.groove-vcard": {
			"source": "iana",
			"extensions": ["vcg"]
		},
		"application/vnd.hal+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hal+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["hal"]
		},
		"application/vnd.handheld-entertainment+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["zmm"]
		},
		"application/vnd.hbci": {
			"source": "iana",
			"extensions": ["hbci"]
		},
		"application/vnd.hc+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hcl-bireports": { "source": "iana" },
		"application/vnd.hdt": { "source": "iana" },
		"application/vnd.heroku+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hhe.lesson-player": {
			"source": "iana",
			"extensions": ["les"]
		},
		"application/vnd.hl7cda+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.hl7v2+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.hp-hpgl": {
			"source": "iana",
			"extensions": ["hpgl"]
		},
		"application/vnd.hp-hpid": {
			"source": "iana",
			"extensions": ["hpid"]
		},
		"application/vnd.hp-hps": {
			"source": "iana",
			"extensions": ["hps"]
		},
		"application/vnd.hp-jlyt": {
			"source": "iana",
			"extensions": ["jlt"]
		},
		"application/vnd.hp-pcl": {
			"source": "iana",
			"extensions": ["pcl"]
		},
		"application/vnd.hp-pclxl": {
			"source": "iana",
			"extensions": ["pclxl"]
		},
		"application/vnd.httphone": { "source": "iana" },
		"application/vnd.hydrostatix.sof-data": {
			"source": "iana",
			"extensions": ["sfd-hdstx"]
		},
		"application/vnd.hyper+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hyper-item+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hyperdrive+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.hzn-3d-crossword": { "source": "iana" },
		"application/vnd.ibm.afplinedata": { "source": "iana" },
		"application/vnd.ibm.electronic-media": { "source": "iana" },
		"application/vnd.ibm.minipay": {
			"source": "iana",
			"extensions": ["mpy"]
		},
		"application/vnd.ibm.modcap": {
			"source": "iana",
			"extensions": [
				"afp",
				"listafp",
				"list3820"
			]
		},
		"application/vnd.ibm.rights-management": {
			"source": "iana",
			"extensions": ["irm"]
		},
		"application/vnd.ibm.secure-container": {
			"source": "iana",
			"extensions": ["sc"]
		},
		"application/vnd.iccprofile": {
			"source": "iana",
			"extensions": ["icc", "icm"]
		},
		"application/vnd.ieee.1905": { "source": "iana" },
		"application/vnd.igloader": {
			"source": "iana",
			"extensions": ["igl"]
		},
		"application/vnd.imagemeter.folder+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.imagemeter.image+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.immervision-ivp": {
			"source": "iana",
			"extensions": ["ivp"]
		},
		"application/vnd.immervision-ivu": {
			"source": "iana",
			"extensions": ["ivu"]
		},
		"application/vnd.ims.imsccv1p1": { "source": "iana" },
		"application/vnd.ims.imsccv1p2": { "source": "iana" },
		"application/vnd.ims.imsccv1p3": { "source": "iana" },
		"application/vnd.ims.lis.v2.result+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolconsumerprofile+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolproxy+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolproxy.id+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolsettings+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ims.lti.v2.toolsettings.simple+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.informedcontrol.rms+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.informix-visionary": { "source": "iana" },
		"application/vnd.infotech.project": { "source": "iana" },
		"application/vnd.infotech.project+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.innopath.wamp.notification": { "source": "iana" },
		"application/vnd.insors.igm": {
			"source": "iana",
			"extensions": ["igm"]
		},
		"application/vnd.intercon.formnet": {
			"source": "iana",
			"extensions": ["xpw", "xpx"]
		},
		"application/vnd.intergeo": {
			"source": "iana",
			"extensions": ["i2g"]
		},
		"application/vnd.intertrust.digibox": { "source": "iana" },
		"application/vnd.intertrust.nncp": { "source": "iana" },
		"application/vnd.intu.qbo": {
			"source": "iana",
			"extensions": ["qbo"]
		},
		"application/vnd.intu.qfx": {
			"source": "iana",
			"extensions": ["qfx"]
		},
		"application/vnd.iptc.g2.catalogitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.conceptitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.knowledgeitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.newsitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.newsmessage+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.packageitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.iptc.g2.planningitem+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ipunplugged.rcprofile": {
			"source": "iana",
			"extensions": ["rcprofile"]
		},
		"application/vnd.irepository.package+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["irp"]
		},
		"application/vnd.is-xpr": {
			"source": "iana",
			"extensions": ["xpr"]
		},
		"application/vnd.isac.fcs": {
			"source": "iana",
			"extensions": ["fcs"]
		},
		"application/vnd.iso11783-10+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.jam": {
			"source": "iana",
			"extensions": ["jam"]
		},
		"application/vnd.japannet-directory-service": { "source": "iana" },
		"application/vnd.japannet-jpnstore-wakeup": { "source": "iana" },
		"application/vnd.japannet-payment-wakeup": { "source": "iana" },
		"application/vnd.japannet-registration": { "source": "iana" },
		"application/vnd.japannet-registration-wakeup": { "source": "iana" },
		"application/vnd.japannet-setstore-wakeup": { "source": "iana" },
		"application/vnd.japannet-verification": { "source": "iana" },
		"application/vnd.japannet-verification-wakeup": { "source": "iana" },
		"application/vnd.jcp.javame.midlet-rms": {
			"source": "iana",
			"extensions": ["rms"]
		},
		"application/vnd.jisp": {
			"source": "iana",
			"extensions": ["jisp"]
		},
		"application/vnd.joost.joda-archive": {
			"source": "iana",
			"extensions": ["joda"]
		},
		"application/vnd.jsk.isdn-ngn": { "source": "iana" },
		"application/vnd.kahootz": {
			"source": "iana",
			"extensions": ["ktz", "ktr"]
		},
		"application/vnd.kde.karbon": {
			"source": "iana",
			"extensions": ["karbon"]
		},
		"application/vnd.kde.kchart": {
			"source": "iana",
			"extensions": ["chrt"]
		},
		"application/vnd.kde.kformula": {
			"source": "iana",
			"extensions": ["kfo"]
		},
		"application/vnd.kde.kivio": {
			"source": "iana",
			"extensions": ["flw"]
		},
		"application/vnd.kde.kontour": {
			"source": "iana",
			"extensions": ["kon"]
		},
		"application/vnd.kde.kpresenter": {
			"source": "iana",
			"extensions": ["kpr", "kpt"]
		},
		"application/vnd.kde.kspread": {
			"source": "iana",
			"extensions": ["ksp"]
		},
		"application/vnd.kde.kword": {
			"source": "iana",
			"extensions": ["kwd", "kwt"]
		},
		"application/vnd.kenameaapp": {
			"source": "iana",
			"extensions": ["htke"]
		},
		"application/vnd.kidspiration": {
			"source": "iana",
			"extensions": ["kia"]
		},
		"application/vnd.kinar": {
			"source": "iana",
			"extensions": ["kne", "knp"]
		},
		"application/vnd.koan": {
			"source": "iana",
			"extensions": [
				"skp",
				"skd",
				"skt",
				"skm"
			]
		},
		"application/vnd.kodak-descriptor": {
			"source": "iana",
			"extensions": ["sse"]
		},
		"application/vnd.las": { "source": "iana" },
		"application/vnd.las.las+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.las.las+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["lasxml"]
		},
		"application/vnd.laszip": { "source": "iana" },
		"application/vnd.leap+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.liberty-request+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.llamagraphics.life-balance.desktop": {
			"source": "iana",
			"extensions": ["lbd"]
		},
		"application/vnd.llamagraphics.life-balance.exchange+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["lbe"]
		},
		"application/vnd.logipipe.circuit+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.loom": { "source": "iana" },
		"application/vnd.lotus-1-2-3": {
			"source": "iana",
			"extensions": ["123"]
		},
		"application/vnd.lotus-approach": {
			"source": "iana",
			"extensions": ["apr"]
		},
		"application/vnd.lotus-freelance": {
			"source": "iana",
			"extensions": ["pre"]
		},
		"application/vnd.lotus-notes": {
			"source": "iana",
			"extensions": ["nsf"]
		},
		"application/vnd.lotus-organizer": {
			"source": "iana",
			"extensions": ["org"]
		},
		"application/vnd.lotus-screencam": {
			"source": "iana",
			"extensions": ["scm"]
		},
		"application/vnd.lotus-wordpro": {
			"source": "iana",
			"extensions": ["lwp"]
		},
		"application/vnd.macports.portpkg": {
			"source": "iana",
			"extensions": ["portpkg"]
		},
		"application/vnd.mapbox-vector-tile": {
			"source": "iana",
			"extensions": ["mvt"]
		},
		"application/vnd.marlin.drm.actiontoken+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.marlin.drm.conftoken+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.marlin.drm.license+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.marlin.drm.mdcf": { "source": "iana" },
		"application/vnd.mason+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.maxar.archive.3tz+zip": {
			"source": "iana",
			"compressible": false
		},
		"application/vnd.maxmind.maxmind-db": { "source": "iana" },
		"application/vnd.mcd": {
			"source": "iana",
			"extensions": ["mcd"]
		},
		"application/vnd.medcalcdata": {
			"source": "iana",
			"extensions": ["mc1"]
		},
		"application/vnd.mediastation.cdkey": {
			"source": "iana",
			"extensions": ["cdkey"]
		},
		"application/vnd.meridian-slingshot": { "source": "iana" },
		"application/vnd.mfer": {
			"source": "iana",
			"extensions": ["mwf"]
		},
		"application/vnd.mfmp": {
			"source": "iana",
			"extensions": ["mfm"]
		},
		"application/vnd.micro+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.micrografx.flo": {
			"source": "iana",
			"extensions": ["flo"]
		},
		"application/vnd.micrografx.igx": {
			"source": "iana",
			"extensions": ["igx"]
		},
		"application/vnd.microsoft.portable-executable": { "source": "iana" },
		"application/vnd.microsoft.windows.thumbnail-cache": { "source": "iana" },
		"application/vnd.miele+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.mif": {
			"source": "iana",
			"extensions": ["mif"]
		},
		"application/vnd.minisoft-hp3000-save": { "source": "iana" },
		"application/vnd.mitsubishi.misty-guard.trustweb": { "source": "iana" },
		"application/vnd.mobius.daf": {
			"source": "iana",
			"extensions": ["daf"]
		},
		"application/vnd.mobius.dis": {
			"source": "iana",
			"extensions": ["dis"]
		},
		"application/vnd.mobius.mbk": {
			"source": "iana",
			"extensions": ["mbk"]
		},
		"application/vnd.mobius.mqy": {
			"source": "iana",
			"extensions": ["mqy"]
		},
		"application/vnd.mobius.msl": {
			"source": "iana",
			"extensions": ["msl"]
		},
		"application/vnd.mobius.plc": {
			"source": "iana",
			"extensions": ["plc"]
		},
		"application/vnd.mobius.txf": {
			"source": "iana",
			"extensions": ["txf"]
		},
		"application/vnd.mophun.application": {
			"source": "iana",
			"extensions": ["mpn"]
		},
		"application/vnd.mophun.certificate": {
			"source": "iana",
			"extensions": ["mpc"]
		},
		"application/vnd.motorola.flexsuite": { "source": "iana" },
		"application/vnd.motorola.flexsuite.adsi": { "source": "iana" },
		"application/vnd.motorola.flexsuite.fis": { "source": "iana" },
		"application/vnd.motorola.flexsuite.gotap": { "source": "iana" },
		"application/vnd.motorola.flexsuite.kmr": { "source": "iana" },
		"application/vnd.motorola.flexsuite.ttc": { "source": "iana" },
		"application/vnd.motorola.flexsuite.wem": { "source": "iana" },
		"application/vnd.motorola.iprm": { "source": "iana" },
		"application/vnd.mozilla.xul+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xul"]
		},
		"application/vnd.ms-3mfdocument": { "source": "iana" },
		"application/vnd.ms-artgalry": {
			"source": "iana",
			"extensions": ["cil"]
		},
		"application/vnd.ms-asf": { "source": "iana" },
		"application/vnd.ms-cab-compressed": {
			"source": "iana",
			"extensions": ["cab"]
		},
		"application/vnd.ms-color.iccprofile": { "source": "apache" },
		"application/vnd.ms-excel": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"xls",
				"xlm",
				"xla",
				"xlc",
				"xlt",
				"xlw"
			]
		},
		"application/vnd.ms-excel.addin.macroenabled.12": {
			"source": "iana",
			"extensions": ["xlam"]
		},
		"application/vnd.ms-excel.sheet.binary.macroenabled.12": {
			"source": "iana",
			"extensions": ["xlsb"]
		},
		"application/vnd.ms-excel.sheet.macroenabled.12": {
			"source": "iana",
			"extensions": ["xlsm"]
		},
		"application/vnd.ms-excel.template.macroenabled.12": {
			"source": "iana",
			"extensions": ["xltm"]
		},
		"application/vnd.ms-fontobject": {
			"source": "iana",
			"compressible": true,
			"extensions": ["eot"]
		},
		"application/vnd.ms-htmlhelp": {
			"source": "iana",
			"extensions": ["chm"]
		},
		"application/vnd.ms-ims": {
			"source": "iana",
			"extensions": ["ims"]
		},
		"application/vnd.ms-lrm": {
			"source": "iana",
			"extensions": ["lrm"]
		},
		"application/vnd.ms-office.activex+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ms-officetheme": {
			"source": "iana",
			"extensions": ["thmx"]
		},
		"application/vnd.ms-opentype": {
			"source": "apache",
			"compressible": true
		},
		"application/vnd.ms-outlook": {
			"compressible": false,
			"extensions": ["msg"]
		},
		"application/vnd.ms-package.obfuscated-opentype": { "source": "apache" },
		"application/vnd.ms-pki.seccat": {
			"source": "apache",
			"extensions": ["cat"]
		},
		"application/vnd.ms-pki.stl": {
			"source": "apache",
			"extensions": ["stl"]
		},
		"application/vnd.ms-playready.initiator+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ms-powerpoint": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"ppt",
				"pps",
				"pot"
			]
		},
		"application/vnd.ms-powerpoint.addin.macroenabled.12": {
			"source": "iana",
			"extensions": ["ppam"]
		},
		"application/vnd.ms-powerpoint.presentation.macroenabled.12": {
			"source": "iana",
			"extensions": ["pptm"]
		},
		"application/vnd.ms-powerpoint.slide.macroenabled.12": {
			"source": "iana",
			"extensions": ["sldm"]
		},
		"application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
			"source": "iana",
			"extensions": ["ppsm"]
		},
		"application/vnd.ms-powerpoint.template.macroenabled.12": {
			"source": "iana",
			"extensions": ["potm"]
		},
		"application/vnd.ms-printdevicecapabilities+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ms-printing.printticket+xml": {
			"source": "apache",
			"compressible": true
		},
		"application/vnd.ms-printschematicket+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ms-project": {
			"source": "iana",
			"extensions": ["mpp", "mpt"]
		},
		"application/vnd.ms-tnef": { "source": "iana" },
		"application/vnd.ms-windows.devicepairing": { "source": "iana" },
		"application/vnd.ms-windows.nwprinting.oob": { "source": "iana" },
		"application/vnd.ms-windows.printerpairing": { "source": "iana" },
		"application/vnd.ms-windows.wsd.oob": { "source": "iana" },
		"application/vnd.ms-wmdrm.lic-chlg-req": { "source": "iana" },
		"application/vnd.ms-wmdrm.lic-resp": { "source": "iana" },
		"application/vnd.ms-wmdrm.meter-chlg-req": { "source": "iana" },
		"application/vnd.ms-wmdrm.meter-resp": { "source": "iana" },
		"application/vnd.ms-word.document.macroenabled.12": {
			"source": "iana",
			"extensions": ["docm"]
		},
		"application/vnd.ms-word.template.macroenabled.12": {
			"source": "iana",
			"extensions": ["dotm"]
		},
		"application/vnd.ms-works": {
			"source": "iana",
			"extensions": [
				"wps",
				"wks",
				"wcm",
				"wdb"
			]
		},
		"application/vnd.ms-wpl": {
			"source": "iana",
			"extensions": ["wpl"]
		},
		"application/vnd.ms-xpsdocument": {
			"source": "iana",
			"compressible": false,
			"extensions": ["xps"]
		},
		"application/vnd.msa-disk-image": { "source": "iana" },
		"application/vnd.mseq": {
			"source": "iana",
			"extensions": ["mseq"]
		},
		"application/vnd.msign": { "source": "iana" },
		"application/vnd.multiad.creator": { "source": "iana" },
		"application/vnd.multiad.creator.cif": { "source": "iana" },
		"application/vnd.music-niff": { "source": "iana" },
		"application/vnd.musician": {
			"source": "iana",
			"extensions": ["mus"]
		},
		"application/vnd.muvee.style": {
			"source": "iana",
			"extensions": ["msty"]
		},
		"application/vnd.mynfc": {
			"source": "iana",
			"extensions": ["taglet"]
		},
		"application/vnd.nacamar.ybrid+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.ncd.control": { "source": "iana" },
		"application/vnd.ncd.reference": { "source": "iana" },
		"application/vnd.nearst.inv+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nebumind.line": { "source": "iana" },
		"application/vnd.nervana": { "source": "iana" },
		"application/vnd.netfpx": { "source": "iana" },
		"application/vnd.neurolanguage.nlu": {
			"source": "iana",
			"extensions": ["nlu"]
		},
		"application/vnd.nimn": { "source": "iana" },
		"application/vnd.nintendo.nitro.rom": { "source": "iana" },
		"application/vnd.nintendo.snes.rom": { "source": "iana" },
		"application/vnd.nitf": {
			"source": "iana",
			"extensions": ["ntf", "nitf"]
		},
		"application/vnd.noblenet-directory": {
			"source": "iana",
			"extensions": ["nnd"]
		},
		"application/vnd.noblenet-sealer": {
			"source": "iana",
			"extensions": ["nns"]
		},
		"application/vnd.noblenet-web": {
			"source": "iana",
			"extensions": ["nnw"]
		},
		"application/vnd.nokia.catalogs": { "source": "iana" },
		"application/vnd.nokia.conml+wbxml": { "source": "iana" },
		"application/vnd.nokia.conml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nokia.iptv.config+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nokia.isds-radio-presets": { "source": "iana" },
		"application/vnd.nokia.landmark+wbxml": { "source": "iana" },
		"application/vnd.nokia.landmark+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nokia.landmarkcollection+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nokia.n-gage.ac+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ac"]
		},
		"application/vnd.nokia.n-gage.data": {
			"source": "iana",
			"extensions": ["ngdat"]
		},
		"application/vnd.nokia.n-gage.symbian.install": {
			"source": "iana",
			"extensions": ["n-gage"]
		},
		"application/vnd.nokia.ncd": { "source": "iana" },
		"application/vnd.nokia.pcd+wbxml": { "source": "iana" },
		"application/vnd.nokia.pcd+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.nokia.radio-preset": {
			"source": "iana",
			"extensions": ["rpst"]
		},
		"application/vnd.nokia.radio-presets": {
			"source": "iana",
			"extensions": ["rpss"]
		},
		"application/vnd.novadigm.edm": {
			"source": "iana",
			"extensions": ["edm"]
		},
		"application/vnd.novadigm.edx": {
			"source": "iana",
			"extensions": ["edx"]
		},
		"application/vnd.novadigm.ext": {
			"source": "iana",
			"extensions": ["ext"]
		},
		"application/vnd.ntt-local.content-share": { "source": "iana" },
		"application/vnd.ntt-local.file-transfer": { "source": "iana" },
		"application/vnd.ntt-local.ogw_remote-access": { "source": "iana" },
		"application/vnd.ntt-local.sip-ta_remote": { "source": "iana" },
		"application/vnd.ntt-local.sip-ta_tcp_stream": { "source": "iana" },
		"application/vnd.oasis.opendocument.chart": {
			"source": "iana",
			"extensions": ["odc"]
		},
		"application/vnd.oasis.opendocument.chart-template": {
			"source": "iana",
			"extensions": ["otc"]
		},
		"application/vnd.oasis.opendocument.database": {
			"source": "iana",
			"extensions": ["odb"]
		},
		"application/vnd.oasis.opendocument.formula": {
			"source": "iana",
			"extensions": ["odf"]
		},
		"application/vnd.oasis.opendocument.formula-template": {
			"source": "iana",
			"extensions": ["odft"]
		},
		"application/vnd.oasis.opendocument.graphics": {
			"source": "iana",
			"compressible": false,
			"extensions": ["odg"]
		},
		"application/vnd.oasis.opendocument.graphics-template": {
			"source": "iana",
			"extensions": ["otg"]
		},
		"application/vnd.oasis.opendocument.image": {
			"source": "iana",
			"extensions": ["odi"]
		},
		"application/vnd.oasis.opendocument.image-template": {
			"source": "iana",
			"extensions": ["oti"]
		},
		"application/vnd.oasis.opendocument.presentation": {
			"source": "iana",
			"compressible": false,
			"extensions": ["odp"]
		},
		"application/vnd.oasis.opendocument.presentation-template": {
			"source": "iana",
			"extensions": ["otp"]
		},
		"application/vnd.oasis.opendocument.spreadsheet": {
			"source": "iana",
			"compressible": false,
			"extensions": ["ods"]
		},
		"application/vnd.oasis.opendocument.spreadsheet-template": {
			"source": "iana",
			"extensions": ["ots"]
		},
		"application/vnd.oasis.opendocument.text": {
			"source": "iana",
			"compressible": false,
			"extensions": ["odt"]
		},
		"application/vnd.oasis.opendocument.text-master": {
			"source": "iana",
			"extensions": ["odm"]
		},
		"application/vnd.oasis.opendocument.text-template": {
			"source": "iana",
			"extensions": ["ott"]
		},
		"application/vnd.oasis.opendocument.text-web": {
			"source": "iana",
			"extensions": ["oth"]
		},
		"application/vnd.obn": { "source": "iana" },
		"application/vnd.ocf+cbor": { "source": "iana" },
		"application/vnd.oci.image.manifest.v1+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oftn.l10n+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.contentaccessdownload+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.contentaccessstreaming+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.cspg-hexbinary": { "source": "iana" },
		"application/vnd.oipf.dae.svg+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.dae.xhtml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.mippvcontrolmessage+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.pae.gem": { "source": "iana" },
		"application/vnd.oipf.spdiscovery+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.spdlist+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.ueprofile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oipf.userprofile+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.olpc-sugar": {
			"source": "iana",
			"extensions": ["xo"]
		},
		"application/vnd.oma-scws-config": { "source": "iana" },
		"application/vnd.oma-scws-http-request": { "source": "iana" },
		"application/vnd.oma-scws-http-response": { "source": "iana" },
		"application/vnd.oma.bcast.associated-procedure-parameter+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.drm-trigger+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.imd+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.ltkm": { "source": "iana" },
		"application/vnd.oma.bcast.notification+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.provisioningtrigger": { "source": "iana" },
		"application/vnd.oma.bcast.sgboot": { "source": "iana" },
		"application/vnd.oma.bcast.sgdd+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.sgdu": { "source": "iana" },
		"application/vnd.oma.bcast.simple-symbol-container": { "source": "iana" },
		"application/vnd.oma.bcast.smartcard-trigger+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.sprov+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.bcast.stkm": { "source": "iana" },
		"application/vnd.oma.cab-address-book+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.cab-feature-handler+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.cab-pcc+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.cab-subs-invite+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.cab-user-prefs+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.dcd": { "source": "iana" },
		"application/vnd.oma.dcdc": { "source": "iana" },
		"application/vnd.oma.dd2+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["dd2"]
		},
		"application/vnd.oma.drm.risd+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.group-usage-list+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.lwm2m+cbor": { "source": "iana" },
		"application/vnd.oma.lwm2m+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.lwm2m+tlv": { "source": "iana" },
		"application/vnd.oma.pal+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.poc.detailed-progress-report+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.poc.final-report+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.poc.groups+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.poc.invocation-descriptor+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.poc.optimized-progress-report+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.push": { "source": "iana" },
		"application/vnd.oma.scidm.messages+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oma.xcap-directory+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.omads-email+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.omads-file+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.omads-folder+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.omaloc-supl-init": { "source": "iana" },
		"application/vnd.onepager": { "source": "iana" },
		"application/vnd.onepagertamp": { "source": "iana" },
		"application/vnd.onepagertamx": { "source": "iana" },
		"application/vnd.onepagertat": { "source": "iana" },
		"application/vnd.onepagertatp": { "source": "iana" },
		"application/vnd.onepagertatx": { "source": "iana" },
		"application/vnd.openblox.game+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["obgx"]
		},
		"application/vnd.openblox.game-binary": { "source": "iana" },
		"application/vnd.openeye.oeb": { "source": "iana" },
		"application/vnd.openofficeorg.extension": {
			"source": "apache",
			"extensions": ["oxt"]
		},
		"application/vnd.openstreetmap.data+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["osm"]
		},
		"application/vnd.opentimestamps.ots": { "source": "iana" },
		"application/vnd.openxmlformats-officedocument.custom-properties+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawing+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.extended-properties+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": {
			"source": "iana",
			"compressible": false,
			"extensions": ["pptx"]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slide": {
			"source": "iana",
			"extensions": ["sldx"]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
			"source": "iana",
			"extensions": ["ppsx"]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.template": {
			"source": "iana",
			"extensions": ["potx"]
		},
		"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
			"source": "iana",
			"compressible": false,
			"extensions": ["xlsx"]
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
			"source": "iana",
			"extensions": ["xltx"]
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.theme+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.themeoverride+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.vmldrawing": { "source": "iana" },
		"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
			"source": "iana",
			"compressible": false,
			"extensions": ["docx"]
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
			"source": "iana",
			"extensions": ["dotx"]
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-package.core-properties+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.openxmlformats-package.relationships+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oracle.resource+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.orange.indata": { "source": "iana" },
		"application/vnd.osa.netdeploy": { "source": "iana" },
		"application/vnd.osgeo.mapguide.package": {
			"source": "iana",
			"extensions": ["mgp"]
		},
		"application/vnd.osgi.bundle": { "source": "iana" },
		"application/vnd.osgi.dp": {
			"source": "iana",
			"extensions": ["dp"]
		},
		"application/vnd.osgi.subsystem": {
			"source": "iana",
			"extensions": ["esa"]
		},
		"application/vnd.otps.ct-kip+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.oxli.countgraph": { "source": "iana" },
		"application/vnd.pagerduty+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.palm": {
			"source": "iana",
			"extensions": [
				"pdb",
				"pqa",
				"oprc"
			]
		},
		"application/vnd.panoply": { "source": "iana" },
		"application/vnd.paos.xml": { "source": "iana" },
		"application/vnd.patentdive": { "source": "iana" },
		"application/vnd.patientecommsdoc": { "source": "iana" },
		"application/vnd.pawaafile": {
			"source": "iana",
			"extensions": ["paw"]
		},
		"application/vnd.pcos": { "source": "iana" },
		"application/vnd.pg.format": {
			"source": "iana",
			"extensions": ["str"]
		},
		"application/vnd.pg.osasli": {
			"source": "iana",
			"extensions": ["ei6"]
		},
		"application/vnd.piaccess.application-licence": { "source": "iana" },
		"application/vnd.picsel": {
			"source": "iana",
			"extensions": ["efif"]
		},
		"application/vnd.pmi.widget": {
			"source": "iana",
			"extensions": ["wg"]
		},
		"application/vnd.poc.group-advertisement+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.pocketlearn": {
			"source": "iana",
			"extensions": ["plf"]
		},
		"application/vnd.powerbuilder6": {
			"source": "iana",
			"extensions": ["pbd"]
		},
		"application/vnd.powerbuilder6-s": { "source": "iana" },
		"application/vnd.powerbuilder7": { "source": "iana" },
		"application/vnd.powerbuilder7-s": { "source": "iana" },
		"application/vnd.powerbuilder75": { "source": "iana" },
		"application/vnd.powerbuilder75-s": { "source": "iana" },
		"application/vnd.preminet": { "source": "iana" },
		"application/vnd.previewsystems.box": {
			"source": "iana",
			"extensions": ["box"]
		},
		"application/vnd.proteus.magazine": {
			"source": "iana",
			"extensions": ["mgz"]
		},
		"application/vnd.psfs": { "source": "iana" },
		"application/vnd.publishare-delta-tree": {
			"source": "iana",
			"extensions": ["qps"]
		},
		"application/vnd.pvi.ptid1": {
			"source": "iana",
			"extensions": ["ptid"]
		},
		"application/vnd.pwg-multiplexed": { "source": "iana" },
		"application/vnd.pwg-xhtml-print+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.qualcomm.brew-app-res": { "source": "iana" },
		"application/vnd.quarantainenet": { "source": "iana" },
		"application/vnd.quark.quarkxpress": {
			"source": "iana",
			"extensions": [
				"qxd",
				"qxt",
				"qwd",
				"qwt",
				"qxl",
				"qxb"
			]
		},
		"application/vnd.quobject-quoxdocument": { "source": "iana" },
		"application/vnd.radisys.moml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-audit+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-audit-conf+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-audit-conn+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-audit-dialog+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-audit-stream+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-conf+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-base+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-fax-detect+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-group+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-speech+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.radisys.msml-dialog-transform+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.rainstor.data": { "source": "iana" },
		"application/vnd.rapid": { "source": "iana" },
		"application/vnd.rar": {
			"source": "iana",
			"extensions": ["rar"]
		},
		"application/vnd.realvnc.bed": {
			"source": "iana",
			"extensions": ["bed"]
		},
		"application/vnd.recordare.musicxml": {
			"source": "iana",
			"extensions": ["mxl"]
		},
		"application/vnd.recordare.musicxml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["musicxml"]
		},
		"application/vnd.renlearn.rlprint": { "source": "iana" },
		"application/vnd.resilient.logic": { "source": "iana" },
		"application/vnd.restful+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.rig.cryptonote": {
			"source": "iana",
			"extensions": ["cryptonote"]
		},
		"application/vnd.rim.cod": {
			"source": "apache",
			"extensions": ["cod"]
		},
		"application/vnd.rn-realmedia": {
			"source": "apache",
			"extensions": ["rm"]
		},
		"application/vnd.rn-realmedia-vbr": {
			"source": "apache",
			"extensions": ["rmvb"]
		},
		"application/vnd.route66.link66+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["link66"]
		},
		"application/vnd.rs-274x": { "source": "iana" },
		"application/vnd.ruckus.download": { "source": "iana" },
		"application/vnd.s3sms": { "source": "iana" },
		"application/vnd.sailingtracker.track": {
			"source": "iana",
			"extensions": ["st"]
		},
		"application/vnd.sar": { "source": "iana" },
		"application/vnd.sbm.cid": { "source": "iana" },
		"application/vnd.sbm.mid2": { "source": "iana" },
		"application/vnd.scribus": { "source": "iana" },
		"application/vnd.sealed.3df": { "source": "iana" },
		"application/vnd.sealed.csf": { "source": "iana" },
		"application/vnd.sealed.doc": { "source": "iana" },
		"application/vnd.sealed.eml": { "source": "iana" },
		"application/vnd.sealed.mht": { "source": "iana" },
		"application/vnd.sealed.net": { "source": "iana" },
		"application/vnd.sealed.ppt": { "source": "iana" },
		"application/vnd.sealed.tiff": { "source": "iana" },
		"application/vnd.sealed.xls": { "source": "iana" },
		"application/vnd.sealedmedia.softseal.html": { "source": "iana" },
		"application/vnd.sealedmedia.softseal.pdf": { "source": "iana" },
		"application/vnd.seemail": {
			"source": "iana",
			"extensions": ["see"]
		},
		"application/vnd.seis+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.sema": {
			"source": "iana",
			"extensions": ["sema"]
		},
		"application/vnd.semd": {
			"source": "iana",
			"extensions": ["semd"]
		},
		"application/vnd.semf": {
			"source": "iana",
			"extensions": ["semf"]
		},
		"application/vnd.shade-save-file": { "source": "iana" },
		"application/vnd.shana.informed.formdata": {
			"source": "iana",
			"extensions": ["ifm"]
		},
		"application/vnd.shana.informed.formtemplate": {
			"source": "iana",
			"extensions": ["itp"]
		},
		"application/vnd.shana.informed.interchange": {
			"source": "iana",
			"extensions": ["iif"]
		},
		"application/vnd.shana.informed.package": {
			"source": "iana",
			"extensions": ["ipk"]
		},
		"application/vnd.shootproof+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.shopkick+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.shp": { "source": "iana" },
		"application/vnd.shx": { "source": "iana" },
		"application/vnd.sigrok.session": { "source": "iana" },
		"application/vnd.simtech-mindmapper": {
			"source": "iana",
			"extensions": ["twd", "twds"]
		},
		"application/vnd.siren+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.smaf": {
			"source": "iana",
			"extensions": ["mmf"]
		},
		"application/vnd.smart.notebook": { "source": "iana" },
		"application/vnd.smart.teacher": {
			"source": "iana",
			"extensions": ["teacher"]
		},
		"application/vnd.snesdev-page-table": { "source": "iana" },
		"application/vnd.software602.filler.form+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["fo"]
		},
		"application/vnd.software602.filler.form-xml-zip": { "source": "iana" },
		"application/vnd.solent.sdkm+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["sdkm", "sdkd"]
		},
		"application/vnd.spotfire.dxp": {
			"source": "iana",
			"extensions": ["dxp"]
		},
		"application/vnd.spotfire.sfs": {
			"source": "iana",
			"extensions": ["sfs"]
		},
		"application/vnd.sqlite3": { "source": "iana" },
		"application/vnd.sss-cod": { "source": "iana" },
		"application/vnd.sss-dtf": { "source": "iana" },
		"application/vnd.sss-ntf": { "source": "iana" },
		"application/vnd.stardivision.calc": {
			"source": "apache",
			"extensions": ["sdc"]
		},
		"application/vnd.stardivision.draw": {
			"source": "apache",
			"extensions": ["sda"]
		},
		"application/vnd.stardivision.impress": {
			"source": "apache",
			"extensions": ["sdd"]
		},
		"application/vnd.stardivision.math": {
			"source": "apache",
			"extensions": ["smf"]
		},
		"application/vnd.stardivision.writer": {
			"source": "apache",
			"extensions": ["sdw", "vor"]
		},
		"application/vnd.stardivision.writer-global": {
			"source": "apache",
			"extensions": ["sgl"]
		},
		"application/vnd.stepmania.package": {
			"source": "iana",
			"extensions": ["smzip"]
		},
		"application/vnd.stepmania.stepchart": {
			"source": "iana",
			"extensions": ["sm"]
		},
		"application/vnd.street-stream": { "source": "iana" },
		"application/vnd.sun.wadl+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wadl"]
		},
		"application/vnd.sun.xml.calc": {
			"source": "apache",
			"extensions": ["sxc"]
		},
		"application/vnd.sun.xml.calc.template": {
			"source": "apache",
			"extensions": ["stc"]
		},
		"application/vnd.sun.xml.draw": {
			"source": "apache",
			"extensions": ["sxd"]
		},
		"application/vnd.sun.xml.draw.template": {
			"source": "apache",
			"extensions": ["std"]
		},
		"application/vnd.sun.xml.impress": {
			"source": "apache",
			"extensions": ["sxi"]
		},
		"application/vnd.sun.xml.impress.template": {
			"source": "apache",
			"extensions": ["sti"]
		},
		"application/vnd.sun.xml.math": {
			"source": "apache",
			"extensions": ["sxm"]
		},
		"application/vnd.sun.xml.writer": {
			"source": "apache",
			"extensions": ["sxw"]
		},
		"application/vnd.sun.xml.writer.global": {
			"source": "apache",
			"extensions": ["sxg"]
		},
		"application/vnd.sun.xml.writer.template": {
			"source": "apache",
			"extensions": ["stw"]
		},
		"application/vnd.sus-calendar": {
			"source": "iana",
			"extensions": ["sus", "susp"]
		},
		"application/vnd.svd": {
			"source": "iana",
			"extensions": ["svd"]
		},
		"application/vnd.swiftview-ics": { "source": "iana" },
		"application/vnd.sycle+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.syft+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.symbian.install": {
			"source": "apache",
			"extensions": ["sis", "sisx"]
		},
		"application/vnd.syncml+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["xsm"]
		},
		"application/vnd.syncml.dm+wbxml": {
			"source": "iana",
			"charset": "UTF-8",
			"extensions": ["bdm"]
		},
		"application/vnd.syncml.dm+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["xdm"]
		},
		"application/vnd.syncml.dm.notification": { "source": "iana" },
		"application/vnd.syncml.dmddf+wbxml": { "source": "iana" },
		"application/vnd.syncml.dmddf+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["ddf"]
		},
		"application/vnd.syncml.dmtnds+wbxml": { "source": "iana" },
		"application/vnd.syncml.dmtnds+xml": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true
		},
		"application/vnd.syncml.ds.notification": { "source": "iana" },
		"application/vnd.tableschema+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.tao.intent-module-archive": {
			"source": "iana",
			"extensions": ["tao"]
		},
		"application/vnd.tcpdump.pcap": {
			"source": "iana",
			"extensions": [
				"pcap",
				"cap",
				"dmp"
			]
		},
		"application/vnd.think-cell.ppttc+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.tmd.mediaflex.api+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.tml": { "source": "iana" },
		"application/vnd.tmobile-livetv": {
			"source": "iana",
			"extensions": ["tmo"]
		},
		"application/vnd.tri.onesource": { "source": "iana" },
		"application/vnd.trid.tpt": {
			"source": "iana",
			"extensions": ["tpt"]
		},
		"application/vnd.triscape.mxs": {
			"source": "iana",
			"extensions": ["mxs"]
		},
		"application/vnd.trueapp": {
			"source": "iana",
			"extensions": ["tra"]
		},
		"application/vnd.truedoc": { "source": "iana" },
		"application/vnd.ubisoft.webplayer": { "source": "iana" },
		"application/vnd.ufdl": {
			"source": "iana",
			"extensions": ["ufd", "ufdl"]
		},
		"application/vnd.uiq.theme": {
			"source": "iana",
			"extensions": ["utz"]
		},
		"application/vnd.umajin": {
			"source": "iana",
			"extensions": ["umj"]
		},
		"application/vnd.unity": {
			"source": "iana",
			"extensions": ["unityweb"]
		},
		"application/vnd.uoml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["uoml"]
		},
		"application/vnd.uplanet.alert": { "source": "iana" },
		"application/vnd.uplanet.alert-wbxml": { "source": "iana" },
		"application/vnd.uplanet.bearer-choice": { "source": "iana" },
		"application/vnd.uplanet.bearer-choice-wbxml": { "source": "iana" },
		"application/vnd.uplanet.cacheop": { "source": "iana" },
		"application/vnd.uplanet.cacheop-wbxml": { "source": "iana" },
		"application/vnd.uplanet.channel": { "source": "iana" },
		"application/vnd.uplanet.channel-wbxml": { "source": "iana" },
		"application/vnd.uplanet.list": { "source": "iana" },
		"application/vnd.uplanet.list-wbxml": { "source": "iana" },
		"application/vnd.uplanet.listcmd": { "source": "iana" },
		"application/vnd.uplanet.listcmd-wbxml": { "source": "iana" },
		"application/vnd.uplanet.signal": { "source": "iana" },
		"application/vnd.uri-map": { "source": "iana" },
		"application/vnd.valve.source.material": { "source": "iana" },
		"application/vnd.vcx": {
			"source": "iana",
			"extensions": ["vcx"]
		},
		"application/vnd.vd-study": { "source": "iana" },
		"application/vnd.vectorworks": { "source": "iana" },
		"application/vnd.vel+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.verimatrix.vcas": { "source": "iana" },
		"application/vnd.veritone.aion+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.veryant.thin": { "source": "iana" },
		"application/vnd.ves.encrypted": { "source": "iana" },
		"application/vnd.vidsoft.vidconference": { "source": "iana" },
		"application/vnd.visio": {
			"source": "iana",
			"extensions": [
				"vsd",
				"vst",
				"vss",
				"vsw"
			]
		},
		"application/vnd.visionary": {
			"source": "iana",
			"extensions": ["vis"]
		},
		"application/vnd.vividence.scriptfile": { "source": "iana" },
		"application/vnd.vsf": {
			"source": "iana",
			"extensions": ["vsf"]
		},
		"application/vnd.wap.sic": { "source": "iana" },
		"application/vnd.wap.slc": { "source": "iana" },
		"application/vnd.wap.wbxml": {
			"source": "iana",
			"charset": "UTF-8",
			"extensions": ["wbxml"]
		},
		"application/vnd.wap.wmlc": {
			"source": "iana",
			"extensions": ["wmlc"]
		},
		"application/vnd.wap.wmlscriptc": {
			"source": "iana",
			"extensions": ["wmlsc"]
		},
		"application/vnd.webturbo": {
			"source": "iana",
			"extensions": ["wtb"]
		},
		"application/vnd.wfa.dpp": { "source": "iana" },
		"application/vnd.wfa.p2p": { "source": "iana" },
		"application/vnd.wfa.wsc": { "source": "iana" },
		"application/vnd.windows.devicepairing": { "source": "iana" },
		"application/vnd.wmc": { "source": "iana" },
		"application/vnd.wmf.bootstrap": { "source": "iana" },
		"application/vnd.wolfram.mathematica": { "source": "iana" },
		"application/vnd.wolfram.mathematica.package": { "source": "iana" },
		"application/vnd.wolfram.player": {
			"source": "iana",
			"extensions": ["nbp"]
		},
		"application/vnd.wordperfect": {
			"source": "iana",
			"extensions": ["wpd"]
		},
		"application/vnd.wqd": {
			"source": "iana",
			"extensions": ["wqd"]
		},
		"application/vnd.wrq-hp3000-labelled": { "source": "iana" },
		"application/vnd.wt.stf": {
			"source": "iana",
			"extensions": ["stf"]
		},
		"application/vnd.wv.csp+wbxml": { "source": "iana" },
		"application/vnd.wv.csp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.wv.ssp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.xacml+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.xara": {
			"source": "iana",
			"extensions": ["xar"]
		},
		"application/vnd.xfdl": {
			"source": "iana",
			"extensions": ["xfdl"]
		},
		"application/vnd.xfdl.webform": { "source": "iana" },
		"application/vnd.xmi+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/vnd.xmpie.cpkg": { "source": "iana" },
		"application/vnd.xmpie.dpkg": { "source": "iana" },
		"application/vnd.xmpie.plan": { "source": "iana" },
		"application/vnd.xmpie.ppkg": { "source": "iana" },
		"application/vnd.xmpie.xlim": { "source": "iana" },
		"application/vnd.yamaha.hv-dic": {
			"source": "iana",
			"extensions": ["hvd"]
		},
		"application/vnd.yamaha.hv-script": {
			"source": "iana",
			"extensions": ["hvs"]
		},
		"application/vnd.yamaha.hv-voice": {
			"source": "iana",
			"extensions": ["hvp"]
		},
		"application/vnd.yamaha.openscoreformat": {
			"source": "iana",
			"extensions": ["osf"]
		},
		"application/vnd.yamaha.openscoreformat.osfpvg+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["osfpvg"]
		},
		"application/vnd.yamaha.remote-setup": { "source": "iana" },
		"application/vnd.yamaha.smaf-audio": {
			"source": "iana",
			"extensions": ["saf"]
		},
		"application/vnd.yamaha.smaf-phrase": {
			"source": "iana",
			"extensions": ["spf"]
		},
		"application/vnd.yamaha.through-ngn": { "source": "iana" },
		"application/vnd.yamaha.tunnel-udpencap": { "source": "iana" },
		"application/vnd.yaoweme": { "source": "iana" },
		"application/vnd.yellowriver-custom-menu": {
			"source": "iana",
			"extensions": ["cmp"]
		},
		"application/vnd.youtube.yt": { "source": "iana" },
		"application/vnd.zul": {
			"source": "iana",
			"extensions": ["zir", "zirz"]
		},
		"application/vnd.zzazz.deck+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["zaz"]
		},
		"application/voicexml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["vxml"]
		},
		"application/voucher-cms+json": {
			"source": "iana",
			"compressible": true
		},
		"application/vq-rtcpxr": { "source": "iana" },
		"application/wasm": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wasm"]
		},
		"application/watcherinfo+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wif"]
		},
		"application/webpush-options+json": {
			"source": "iana",
			"compressible": true
		},
		"application/whoispp-query": { "source": "iana" },
		"application/whoispp-response": { "source": "iana" },
		"application/widget": {
			"source": "iana",
			"extensions": ["wgt"]
		},
		"application/winhlp": {
			"source": "apache",
			"extensions": ["hlp"]
		},
		"application/wita": { "source": "iana" },
		"application/wordperfect5.1": { "source": "iana" },
		"application/wsdl+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wsdl"]
		},
		"application/wspolicy+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["wspolicy"]
		},
		"application/x-7z-compressed": {
			"source": "apache",
			"compressible": false,
			"extensions": ["7z"]
		},
		"application/x-abiword": {
			"source": "apache",
			"extensions": ["abw"]
		},
		"application/x-ace-compressed": {
			"source": "apache",
			"extensions": ["ace"]
		},
		"application/x-amf": { "source": "apache" },
		"application/x-apple-diskimage": {
			"source": "apache",
			"extensions": ["dmg"]
		},
		"application/x-arj": {
			"compressible": false,
			"extensions": ["arj"]
		},
		"application/x-authorware-bin": {
			"source": "apache",
			"extensions": [
				"aab",
				"x32",
				"u32",
				"vox"
			]
		},
		"application/x-authorware-map": {
			"source": "apache",
			"extensions": ["aam"]
		},
		"application/x-authorware-seg": {
			"source": "apache",
			"extensions": ["aas"]
		},
		"application/x-bcpio": {
			"source": "apache",
			"extensions": ["bcpio"]
		},
		"application/x-bdoc": {
			"compressible": false,
			"extensions": ["bdoc"]
		},
		"application/x-bittorrent": {
			"source": "apache",
			"extensions": ["torrent"]
		},
		"application/x-blorb": {
			"source": "apache",
			"extensions": ["blb", "blorb"]
		},
		"application/x-bzip": {
			"source": "apache",
			"compressible": false,
			"extensions": ["bz"]
		},
		"application/x-bzip2": {
			"source": "apache",
			"compressible": false,
			"extensions": ["bz2", "boz"]
		},
		"application/x-cbr": {
			"source": "apache",
			"extensions": [
				"cbr",
				"cba",
				"cbt",
				"cbz",
				"cb7"
			]
		},
		"application/x-cdlink": {
			"source": "apache",
			"extensions": ["vcd"]
		},
		"application/x-cfs-compressed": {
			"source": "apache",
			"extensions": ["cfs"]
		},
		"application/x-chat": {
			"source": "apache",
			"extensions": ["chat"]
		},
		"application/x-chess-pgn": {
			"source": "apache",
			"extensions": ["pgn"]
		},
		"application/x-chrome-extension": { "extensions": ["crx"] },
		"application/x-cocoa": {
			"source": "nginx",
			"extensions": ["cco"]
		},
		"application/x-compress": { "source": "apache" },
		"application/x-conference": {
			"source": "apache",
			"extensions": ["nsc"]
		},
		"application/x-cpio": {
			"source": "apache",
			"extensions": ["cpio"]
		},
		"application/x-csh": {
			"source": "apache",
			"extensions": ["csh"]
		},
		"application/x-deb": { "compressible": false },
		"application/x-debian-package": {
			"source": "apache",
			"extensions": ["deb", "udeb"]
		},
		"application/x-dgc-compressed": {
			"source": "apache",
			"extensions": ["dgc"]
		},
		"application/x-director": {
			"source": "apache",
			"extensions": [
				"dir",
				"dcr",
				"dxr",
				"cst",
				"cct",
				"cxt",
				"w3d",
				"fgd",
				"swa"
			]
		},
		"application/x-doom": {
			"source": "apache",
			"extensions": ["wad"]
		},
		"application/x-dtbncx+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["ncx"]
		},
		"application/x-dtbook+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["dtb"]
		},
		"application/x-dtbresource+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["res"]
		},
		"application/x-dvi": {
			"source": "apache",
			"compressible": false,
			"extensions": ["dvi"]
		},
		"application/x-envoy": {
			"source": "apache",
			"extensions": ["evy"]
		},
		"application/x-eva": {
			"source": "apache",
			"extensions": ["eva"]
		},
		"application/x-font-bdf": {
			"source": "apache",
			"extensions": ["bdf"]
		},
		"application/x-font-dos": { "source": "apache" },
		"application/x-font-framemaker": { "source": "apache" },
		"application/x-font-ghostscript": {
			"source": "apache",
			"extensions": ["gsf"]
		},
		"application/x-font-libgrx": { "source": "apache" },
		"application/x-font-linux-psf": {
			"source": "apache",
			"extensions": ["psf"]
		},
		"application/x-font-pcf": {
			"source": "apache",
			"extensions": ["pcf"]
		},
		"application/x-font-snf": {
			"source": "apache",
			"extensions": ["snf"]
		},
		"application/x-font-speedo": { "source": "apache" },
		"application/x-font-sunos-news": { "source": "apache" },
		"application/x-font-type1": {
			"source": "apache",
			"extensions": [
				"pfa",
				"pfb",
				"pfm",
				"afm"
			]
		},
		"application/x-font-vfont": { "source": "apache" },
		"application/x-freearc": {
			"source": "apache",
			"extensions": ["arc"]
		},
		"application/x-futuresplash": {
			"source": "apache",
			"extensions": ["spl"]
		},
		"application/x-gca-compressed": {
			"source": "apache",
			"extensions": ["gca"]
		},
		"application/x-glulx": {
			"source": "apache",
			"extensions": ["ulx"]
		},
		"application/x-gnumeric": {
			"source": "apache",
			"extensions": ["gnumeric"]
		},
		"application/x-gramps-xml": {
			"source": "apache",
			"extensions": ["gramps"]
		},
		"application/x-gtar": {
			"source": "apache",
			"extensions": ["gtar"]
		},
		"application/x-gzip": { "source": "apache" },
		"application/x-hdf": {
			"source": "apache",
			"extensions": ["hdf"]
		},
		"application/x-httpd-php": {
			"compressible": true,
			"extensions": ["php"]
		},
		"application/x-install-instructions": {
			"source": "apache",
			"extensions": ["install"]
		},
		"application/x-iso9660-image": {
			"source": "apache",
			"extensions": ["iso"]
		},
		"application/x-iwork-keynote-sffkey": { "extensions": ["key"] },
		"application/x-iwork-numbers-sffnumbers": { "extensions": ["numbers"] },
		"application/x-iwork-pages-sffpages": { "extensions": ["pages"] },
		"application/x-java-archive-diff": {
			"source": "nginx",
			"extensions": ["jardiff"]
		},
		"application/x-java-jnlp-file": {
			"source": "apache",
			"compressible": false,
			"extensions": ["jnlp"]
		},
		"application/x-javascript": { "compressible": true },
		"application/x-keepass2": { "extensions": ["kdbx"] },
		"application/x-latex": {
			"source": "apache",
			"compressible": false,
			"extensions": ["latex"]
		},
		"application/x-lua-bytecode": { "extensions": ["luac"] },
		"application/x-lzh-compressed": {
			"source": "apache",
			"extensions": ["lzh", "lha"]
		},
		"application/x-makeself": {
			"source": "nginx",
			"extensions": ["run"]
		},
		"application/x-mie": {
			"source": "apache",
			"extensions": ["mie"]
		},
		"application/x-mobipocket-ebook": {
			"source": "apache",
			"extensions": ["prc", "mobi"]
		},
		"application/x-mpegurl": { "compressible": false },
		"application/x-ms-application": {
			"source": "apache",
			"extensions": ["application"]
		},
		"application/x-ms-shortcut": {
			"source": "apache",
			"extensions": ["lnk"]
		},
		"application/x-ms-wmd": {
			"source": "apache",
			"extensions": ["wmd"]
		},
		"application/x-ms-wmz": {
			"source": "apache",
			"extensions": ["wmz"]
		},
		"application/x-ms-xbap": {
			"source": "apache",
			"extensions": ["xbap"]
		},
		"application/x-msaccess": {
			"source": "apache",
			"extensions": ["mdb"]
		},
		"application/x-msbinder": {
			"source": "apache",
			"extensions": ["obd"]
		},
		"application/x-mscardfile": {
			"source": "apache",
			"extensions": ["crd"]
		},
		"application/x-msclip": {
			"source": "apache",
			"extensions": ["clp"]
		},
		"application/x-msdos-program": { "extensions": ["exe"] },
		"application/x-msdownload": {
			"source": "apache",
			"extensions": [
				"exe",
				"dll",
				"com",
				"bat",
				"msi"
			]
		},
		"application/x-msmediaview": {
			"source": "apache",
			"extensions": [
				"mvb",
				"m13",
				"m14"
			]
		},
		"application/x-msmetafile": {
			"source": "apache",
			"extensions": [
				"wmf",
				"wmz",
				"emf",
				"emz"
			]
		},
		"application/x-msmoney": {
			"source": "apache",
			"extensions": ["mny"]
		},
		"application/x-mspublisher": {
			"source": "apache",
			"extensions": ["pub"]
		},
		"application/x-msschedule": {
			"source": "apache",
			"extensions": ["scd"]
		},
		"application/x-msterminal": {
			"source": "apache",
			"extensions": ["trm"]
		},
		"application/x-mswrite": {
			"source": "apache",
			"extensions": ["wri"]
		},
		"application/x-netcdf": {
			"source": "apache",
			"extensions": ["nc", "cdf"]
		},
		"application/x-ns-proxy-autoconfig": {
			"compressible": true,
			"extensions": ["pac"]
		},
		"application/x-nzb": {
			"source": "apache",
			"extensions": ["nzb"]
		},
		"application/x-perl": {
			"source": "nginx",
			"extensions": ["pl", "pm"]
		},
		"application/x-pilot": {
			"source": "nginx",
			"extensions": ["prc", "pdb"]
		},
		"application/x-pkcs12": {
			"source": "apache",
			"compressible": false,
			"extensions": ["p12", "pfx"]
		},
		"application/x-pkcs7-certificates": {
			"source": "apache",
			"extensions": ["p7b", "spc"]
		},
		"application/x-pkcs7-certreqresp": {
			"source": "apache",
			"extensions": ["p7r"]
		},
		"application/x-pki-message": { "source": "iana" },
		"application/x-rar-compressed": {
			"source": "apache",
			"compressible": false,
			"extensions": ["rar"]
		},
		"application/x-redhat-package-manager": {
			"source": "nginx",
			"extensions": ["rpm"]
		},
		"application/x-research-info-systems": {
			"source": "apache",
			"extensions": ["ris"]
		},
		"application/x-sea": {
			"source": "nginx",
			"extensions": ["sea"]
		},
		"application/x-sh": {
			"source": "apache",
			"compressible": true,
			"extensions": ["sh"]
		},
		"application/x-shar": {
			"source": "apache",
			"extensions": ["shar"]
		},
		"application/x-shockwave-flash": {
			"source": "apache",
			"compressible": false,
			"extensions": ["swf"]
		},
		"application/x-silverlight-app": {
			"source": "apache",
			"extensions": ["xap"]
		},
		"application/x-sql": {
			"source": "apache",
			"extensions": ["sql"]
		},
		"application/x-stuffit": {
			"source": "apache",
			"compressible": false,
			"extensions": ["sit"]
		},
		"application/x-stuffitx": {
			"source": "apache",
			"extensions": ["sitx"]
		},
		"application/x-subrip": {
			"source": "apache",
			"extensions": ["srt"]
		},
		"application/x-sv4cpio": {
			"source": "apache",
			"extensions": ["sv4cpio"]
		},
		"application/x-sv4crc": {
			"source": "apache",
			"extensions": ["sv4crc"]
		},
		"application/x-t3vm-image": {
			"source": "apache",
			"extensions": ["t3"]
		},
		"application/x-tads": {
			"source": "apache",
			"extensions": ["gam"]
		},
		"application/x-tar": {
			"source": "apache",
			"compressible": true,
			"extensions": ["tar"]
		},
		"application/x-tcl": {
			"source": "apache",
			"extensions": ["tcl", "tk"]
		},
		"application/x-tex": {
			"source": "apache",
			"extensions": ["tex"]
		},
		"application/x-tex-tfm": {
			"source": "apache",
			"extensions": ["tfm"]
		},
		"application/x-texinfo": {
			"source": "apache",
			"extensions": ["texinfo", "texi"]
		},
		"application/x-tgif": {
			"source": "apache",
			"extensions": ["obj"]
		},
		"application/x-ustar": {
			"source": "apache",
			"extensions": ["ustar"]
		},
		"application/x-virtualbox-hdd": {
			"compressible": true,
			"extensions": ["hdd"]
		},
		"application/x-virtualbox-ova": {
			"compressible": true,
			"extensions": ["ova"]
		},
		"application/x-virtualbox-ovf": {
			"compressible": true,
			"extensions": ["ovf"]
		},
		"application/x-virtualbox-vbox": {
			"compressible": true,
			"extensions": ["vbox"]
		},
		"application/x-virtualbox-vbox-extpack": {
			"compressible": false,
			"extensions": ["vbox-extpack"]
		},
		"application/x-virtualbox-vdi": {
			"compressible": true,
			"extensions": ["vdi"]
		},
		"application/x-virtualbox-vhd": {
			"compressible": true,
			"extensions": ["vhd"]
		},
		"application/x-virtualbox-vmdk": {
			"compressible": true,
			"extensions": ["vmdk"]
		},
		"application/x-wais-source": {
			"source": "apache",
			"extensions": ["src"]
		},
		"application/x-web-app-manifest+json": {
			"compressible": true,
			"extensions": ["webapp"]
		},
		"application/x-www-form-urlencoded": {
			"source": "iana",
			"compressible": true
		},
		"application/x-x509-ca-cert": {
			"source": "iana",
			"extensions": [
				"der",
				"crt",
				"pem"
			]
		},
		"application/x-x509-ca-ra-cert": { "source": "iana" },
		"application/x-x509-next-ca-cert": { "source": "iana" },
		"application/x-xfig": {
			"source": "apache",
			"extensions": ["fig"]
		},
		"application/x-xliff+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["xlf"]
		},
		"application/x-xpinstall": {
			"source": "apache",
			"compressible": false,
			"extensions": ["xpi"]
		},
		"application/x-xz": {
			"source": "apache",
			"extensions": ["xz"]
		},
		"application/x-zmachine": {
			"source": "apache",
			"extensions": [
				"z1",
				"z2",
				"z3",
				"z4",
				"z5",
				"z6",
				"z7",
				"z8"
			]
		},
		"application/x400-bp": { "source": "iana" },
		"application/xacml+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xaml+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["xaml"]
		},
		"application/xcap-att+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xav"]
		},
		"application/xcap-caps+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xca"]
		},
		"application/xcap-diff+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xdf"]
		},
		"application/xcap-el+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xel"]
		},
		"application/xcap-error+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xcap-ns+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xns"]
		},
		"application/xcon-conference-info+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xcon-conference-info-diff+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xenc+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xenc"]
		},
		"application/xhtml+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xhtml", "xht"]
		},
		"application/xhtml-voice+xml": {
			"source": "apache",
			"compressible": true
		},
		"application/xliff+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xlf"]
		},
		"application/xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"xml",
				"xsl",
				"xsd",
				"rng"
			]
		},
		"application/xml-dtd": {
			"source": "iana",
			"compressible": true,
			"extensions": ["dtd"]
		},
		"application/xml-external-parsed-entity": { "source": "iana" },
		"application/xml-patch+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xmpp+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/xop+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xop"]
		},
		"application/xproc+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["xpl"]
		},
		"application/xslt+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xsl", "xslt"]
		},
		"application/xspf+xml": {
			"source": "apache",
			"compressible": true,
			"extensions": ["xspf"]
		},
		"application/xv+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"mxml",
				"xhvml",
				"xvml",
				"xvm"
			]
		},
		"application/yang": {
			"source": "iana",
			"extensions": ["yang"]
		},
		"application/yang-data+json": {
			"source": "iana",
			"compressible": true
		},
		"application/yang-data+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/yang-patch+json": {
			"source": "iana",
			"compressible": true
		},
		"application/yang-patch+xml": {
			"source": "iana",
			"compressible": true
		},
		"application/yin+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["yin"]
		},
		"application/zip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["zip"]
		},
		"application/zlib": { "source": "iana" },
		"application/zstd": { "source": "iana" },
		"audio/1d-interleaved-parityfec": { "source": "iana" },
		"audio/32kadpcm": { "source": "iana" },
		"audio/3gpp": {
			"source": "iana",
			"compressible": false,
			"extensions": ["3gpp"]
		},
		"audio/3gpp2": { "source": "iana" },
		"audio/aac": { "source": "iana" },
		"audio/ac3": { "source": "iana" },
		"audio/adpcm": {
			"source": "apache",
			"extensions": ["adp"]
		},
		"audio/amr": {
			"source": "iana",
			"extensions": ["amr"]
		},
		"audio/amr-wb": { "source": "iana" },
		"audio/amr-wb+": { "source": "iana" },
		"audio/aptx": { "source": "iana" },
		"audio/asc": { "source": "iana" },
		"audio/atrac-advanced-lossless": { "source": "iana" },
		"audio/atrac-x": { "source": "iana" },
		"audio/atrac3": { "source": "iana" },
		"audio/basic": {
			"source": "iana",
			"compressible": false,
			"extensions": ["au", "snd"]
		},
		"audio/bv16": { "source": "iana" },
		"audio/bv32": { "source": "iana" },
		"audio/clearmode": { "source": "iana" },
		"audio/cn": { "source": "iana" },
		"audio/dat12": { "source": "iana" },
		"audio/dls": { "source": "iana" },
		"audio/dsr-es201108": { "source": "iana" },
		"audio/dsr-es202050": { "source": "iana" },
		"audio/dsr-es202211": { "source": "iana" },
		"audio/dsr-es202212": { "source": "iana" },
		"audio/dv": { "source": "iana" },
		"audio/dvi4": { "source": "iana" },
		"audio/eac3": { "source": "iana" },
		"audio/encaprtp": { "source": "iana" },
		"audio/evrc": { "source": "iana" },
		"audio/evrc-qcp": { "source": "iana" },
		"audio/evrc0": { "source": "iana" },
		"audio/evrc1": { "source": "iana" },
		"audio/evrcb": { "source": "iana" },
		"audio/evrcb0": { "source": "iana" },
		"audio/evrcb1": { "source": "iana" },
		"audio/evrcnw": { "source": "iana" },
		"audio/evrcnw0": { "source": "iana" },
		"audio/evrcnw1": { "source": "iana" },
		"audio/evrcwb": { "source": "iana" },
		"audio/evrcwb0": { "source": "iana" },
		"audio/evrcwb1": { "source": "iana" },
		"audio/evs": { "source": "iana" },
		"audio/flexfec": { "source": "iana" },
		"audio/fwdred": { "source": "iana" },
		"audio/g711-0": { "source": "iana" },
		"audio/g719": { "source": "iana" },
		"audio/g722": { "source": "iana" },
		"audio/g7221": { "source": "iana" },
		"audio/g723": { "source": "iana" },
		"audio/g726-16": { "source": "iana" },
		"audio/g726-24": { "source": "iana" },
		"audio/g726-32": { "source": "iana" },
		"audio/g726-40": { "source": "iana" },
		"audio/g728": { "source": "iana" },
		"audio/g729": { "source": "iana" },
		"audio/g7291": { "source": "iana" },
		"audio/g729d": { "source": "iana" },
		"audio/g729e": { "source": "iana" },
		"audio/gsm": { "source": "iana" },
		"audio/gsm-efr": { "source": "iana" },
		"audio/gsm-hr-08": { "source": "iana" },
		"audio/ilbc": { "source": "iana" },
		"audio/ip-mr_v2.5": { "source": "iana" },
		"audio/isac": { "source": "apache" },
		"audio/l16": { "source": "iana" },
		"audio/l20": { "source": "iana" },
		"audio/l24": {
			"source": "iana",
			"compressible": false
		},
		"audio/l8": { "source": "iana" },
		"audio/lpc": { "source": "iana" },
		"audio/melp": { "source": "iana" },
		"audio/melp1200": { "source": "iana" },
		"audio/melp2400": { "source": "iana" },
		"audio/melp600": { "source": "iana" },
		"audio/mhas": { "source": "iana" },
		"audio/midi": {
			"source": "apache",
			"extensions": [
				"mid",
				"midi",
				"kar",
				"rmi"
			]
		},
		"audio/mobile-xmf": {
			"source": "iana",
			"extensions": ["mxmf"]
		},
		"audio/mp3": {
			"compressible": false,
			"extensions": ["mp3"]
		},
		"audio/mp4": {
			"source": "iana",
			"compressible": false,
			"extensions": ["m4a", "mp4a"]
		},
		"audio/mp4a-latm": { "source": "iana" },
		"audio/mpa": { "source": "iana" },
		"audio/mpa-robust": { "source": "iana" },
		"audio/mpeg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"mpga",
				"mp2",
				"mp2a",
				"mp3",
				"m2a",
				"m3a"
			]
		},
		"audio/mpeg4-generic": { "source": "iana" },
		"audio/musepack": { "source": "apache" },
		"audio/ogg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"oga",
				"ogg",
				"spx",
				"opus"
			]
		},
		"audio/opus": { "source": "iana" },
		"audio/parityfec": { "source": "iana" },
		"audio/pcma": { "source": "iana" },
		"audio/pcma-wb": { "source": "iana" },
		"audio/pcmu": { "source": "iana" },
		"audio/pcmu-wb": { "source": "iana" },
		"audio/prs.sid": { "source": "iana" },
		"audio/qcelp": { "source": "iana" },
		"audio/raptorfec": { "source": "iana" },
		"audio/red": { "source": "iana" },
		"audio/rtp-enc-aescm128": { "source": "iana" },
		"audio/rtp-midi": { "source": "iana" },
		"audio/rtploopback": { "source": "iana" },
		"audio/rtx": { "source": "iana" },
		"audio/s3m": {
			"source": "apache",
			"extensions": ["s3m"]
		},
		"audio/scip": { "source": "iana" },
		"audio/silk": {
			"source": "apache",
			"extensions": ["sil"]
		},
		"audio/smv": { "source": "iana" },
		"audio/smv-qcp": { "source": "iana" },
		"audio/smv0": { "source": "iana" },
		"audio/sofa": { "source": "iana" },
		"audio/sp-midi": { "source": "iana" },
		"audio/speex": { "source": "iana" },
		"audio/t140c": { "source": "iana" },
		"audio/t38": { "source": "iana" },
		"audio/telephone-event": { "source": "iana" },
		"audio/tetra_acelp": { "source": "iana" },
		"audio/tetra_acelp_bb": { "source": "iana" },
		"audio/tone": { "source": "iana" },
		"audio/tsvcis": { "source": "iana" },
		"audio/uemclip": { "source": "iana" },
		"audio/ulpfec": { "source": "iana" },
		"audio/usac": { "source": "iana" },
		"audio/vdvi": { "source": "iana" },
		"audio/vmr-wb": { "source": "iana" },
		"audio/vnd.3gpp.iufp": { "source": "iana" },
		"audio/vnd.4sb": { "source": "iana" },
		"audio/vnd.audiokoz": { "source": "iana" },
		"audio/vnd.celp": { "source": "iana" },
		"audio/vnd.cisco.nse": { "source": "iana" },
		"audio/vnd.cmles.radio-events": { "source": "iana" },
		"audio/vnd.cns.anp1": { "source": "iana" },
		"audio/vnd.cns.inf1": { "source": "iana" },
		"audio/vnd.dece.audio": {
			"source": "iana",
			"extensions": ["uva", "uvva"]
		},
		"audio/vnd.digital-winds": {
			"source": "iana",
			"extensions": ["eol"]
		},
		"audio/vnd.dlna.adts": { "source": "iana" },
		"audio/vnd.dolby.heaac.1": { "source": "iana" },
		"audio/vnd.dolby.heaac.2": { "source": "iana" },
		"audio/vnd.dolby.mlp": { "source": "iana" },
		"audio/vnd.dolby.mps": { "source": "iana" },
		"audio/vnd.dolby.pl2": { "source": "iana" },
		"audio/vnd.dolby.pl2x": { "source": "iana" },
		"audio/vnd.dolby.pl2z": { "source": "iana" },
		"audio/vnd.dolby.pulse.1": { "source": "iana" },
		"audio/vnd.dra": {
			"source": "iana",
			"extensions": ["dra"]
		},
		"audio/vnd.dts": {
			"source": "iana",
			"extensions": ["dts"]
		},
		"audio/vnd.dts.hd": {
			"source": "iana",
			"extensions": ["dtshd"]
		},
		"audio/vnd.dts.uhd": { "source": "iana" },
		"audio/vnd.dvb.file": { "source": "iana" },
		"audio/vnd.everad.plj": { "source": "iana" },
		"audio/vnd.hns.audio": { "source": "iana" },
		"audio/vnd.lucent.voice": {
			"source": "iana",
			"extensions": ["lvp"]
		},
		"audio/vnd.ms-playready.media.pya": {
			"source": "iana",
			"extensions": ["pya"]
		},
		"audio/vnd.nokia.mobile-xmf": { "source": "iana" },
		"audio/vnd.nortel.vbk": { "source": "iana" },
		"audio/vnd.nuera.ecelp4800": {
			"source": "iana",
			"extensions": ["ecelp4800"]
		},
		"audio/vnd.nuera.ecelp7470": {
			"source": "iana",
			"extensions": ["ecelp7470"]
		},
		"audio/vnd.nuera.ecelp9600": {
			"source": "iana",
			"extensions": ["ecelp9600"]
		},
		"audio/vnd.octel.sbc": { "source": "iana" },
		"audio/vnd.presonus.multitrack": { "source": "iana" },
		"audio/vnd.qcelp": { "source": "iana" },
		"audio/vnd.rhetorex.32kadpcm": { "source": "iana" },
		"audio/vnd.rip": {
			"source": "iana",
			"extensions": ["rip"]
		},
		"audio/vnd.rn-realaudio": { "compressible": false },
		"audio/vnd.sealedmedia.softseal.mpeg": { "source": "iana" },
		"audio/vnd.vmx.cvsd": { "source": "iana" },
		"audio/vnd.wave": { "compressible": false },
		"audio/vorbis": {
			"source": "iana",
			"compressible": false
		},
		"audio/vorbis-config": { "source": "iana" },
		"audio/wav": {
			"compressible": false,
			"extensions": ["wav"]
		},
		"audio/wave": {
			"compressible": false,
			"extensions": ["wav"]
		},
		"audio/webm": {
			"source": "apache",
			"compressible": false,
			"extensions": ["weba"]
		},
		"audio/x-aac": {
			"source": "apache",
			"compressible": false,
			"extensions": ["aac"]
		},
		"audio/x-aiff": {
			"source": "apache",
			"extensions": [
				"aif",
				"aiff",
				"aifc"
			]
		},
		"audio/x-caf": {
			"source": "apache",
			"compressible": false,
			"extensions": ["caf"]
		},
		"audio/x-flac": {
			"source": "apache",
			"extensions": ["flac"]
		},
		"audio/x-m4a": {
			"source": "nginx",
			"extensions": ["m4a"]
		},
		"audio/x-matroska": {
			"source": "apache",
			"extensions": ["mka"]
		},
		"audio/x-mpegurl": {
			"source": "apache",
			"extensions": ["m3u"]
		},
		"audio/x-ms-wax": {
			"source": "apache",
			"extensions": ["wax"]
		},
		"audio/x-ms-wma": {
			"source": "apache",
			"extensions": ["wma"]
		},
		"audio/x-pn-realaudio": {
			"source": "apache",
			"extensions": ["ram", "ra"]
		},
		"audio/x-pn-realaudio-plugin": {
			"source": "apache",
			"extensions": ["rmp"]
		},
		"audio/x-realaudio": {
			"source": "nginx",
			"extensions": ["ra"]
		},
		"audio/x-tta": { "source": "apache" },
		"audio/x-wav": {
			"source": "apache",
			"extensions": ["wav"]
		},
		"audio/xm": {
			"source": "apache",
			"extensions": ["xm"]
		},
		"chemical/x-cdx": {
			"source": "apache",
			"extensions": ["cdx"]
		},
		"chemical/x-cif": {
			"source": "apache",
			"extensions": ["cif"]
		},
		"chemical/x-cmdf": {
			"source": "apache",
			"extensions": ["cmdf"]
		},
		"chemical/x-cml": {
			"source": "apache",
			"extensions": ["cml"]
		},
		"chemical/x-csml": {
			"source": "apache",
			"extensions": ["csml"]
		},
		"chemical/x-pdb": { "source": "apache" },
		"chemical/x-xyz": {
			"source": "apache",
			"extensions": ["xyz"]
		},
		"font/collection": {
			"source": "iana",
			"extensions": ["ttc"]
		},
		"font/otf": {
			"source": "iana",
			"compressible": true,
			"extensions": ["otf"]
		},
		"font/sfnt": { "source": "iana" },
		"font/ttf": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ttf"]
		},
		"font/woff": {
			"source": "iana",
			"extensions": ["woff"]
		},
		"font/woff2": {
			"source": "iana",
			"extensions": ["woff2"]
		},
		"image/aces": {
			"source": "iana",
			"extensions": ["exr"]
		},
		"image/apng": {
			"compressible": false,
			"extensions": ["apng"]
		},
		"image/avci": {
			"source": "iana",
			"extensions": ["avci"]
		},
		"image/avcs": {
			"source": "iana",
			"extensions": ["avcs"]
		},
		"image/avif": {
			"source": "iana",
			"compressible": false,
			"extensions": ["avif"]
		},
		"image/bmp": {
			"source": "iana",
			"compressible": true,
			"extensions": ["bmp"]
		},
		"image/cgm": {
			"source": "iana",
			"extensions": ["cgm"]
		},
		"image/dicom-rle": {
			"source": "iana",
			"extensions": ["drle"]
		},
		"image/emf": {
			"source": "iana",
			"extensions": ["emf"]
		},
		"image/fits": {
			"source": "iana",
			"extensions": ["fits"]
		},
		"image/g3fax": {
			"source": "iana",
			"extensions": ["g3"]
		},
		"image/gif": {
			"source": "iana",
			"compressible": false,
			"extensions": ["gif"]
		},
		"image/heic": {
			"source": "iana",
			"extensions": ["heic"]
		},
		"image/heic-sequence": {
			"source": "iana",
			"extensions": ["heics"]
		},
		"image/heif": {
			"source": "iana",
			"extensions": ["heif"]
		},
		"image/heif-sequence": {
			"source": "iana",
			"extensions": ["heifs"]
		},
		"image/hej2k": {
			"source": "iana",
			"extensions": ["hej2"]
		},
		"image/hsj2": {
			"source": "iana",
			"extensions": ["hsj2"]
		},
		"image/ief": {
			"source": "iana",
			"extensions": ["ief"]
		},
		"image/jls": {
			"source": "iana",
			"extensions": ["jls"]
		},
		"image/jp2": {
			"source": "iana",
			"compressible": false,
			"extensions": ["jp2", "jpg2"]
		},
		"image/jpeg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"jpeg",
				"jpg",
				"jpe"
			]
		},
		"image/jph": {
			"source": "iana",
			"extensions": ["jph"]
		},
		"image/jphc": {
			"source": "iana",
			"extensions": ["jhc"]
		},
		"image/jpm": {
			"source": "iana",
			"compressible": false,
			"extensions": ["jpm"]
		},
		"image/jpx": {
			"source": "iana",
			"compressible": false,
			"extensions": ["jpx", "jpf"]
		},
		"image/jxr": {
			"source": "iana",
			"extensions": ["jxr"]
		},
		"image/jxra": {
			"source": "iana",
			"extensions": ["jxra"]
		},
		"image/jxrs": {
			"source": "iana",
			"extensions": ["jxrs"]
		},
		"image/jxs": {
			"source": "iana",
			"extensions": ["jxs"]
		},
		"image/jxsc": {
			"source": "iana",
			"extensions": ["jxsc"]
		},
		"image/jxsi": {
			"source": "iana",
			"extensions": ["jxsi"]
		},
		"image/jxss": {
			"source": "iana",
			"extensions": ["jxss"]
		},
		"image/ktx": {
			"source": "iana",
			"extensions": ["ktx"]
		},
		"image/ktx2": {
			"source": "iana",
			"extensions": ["ktx2"]
		},
		"image/naplps": { "source": "iana" },
		"image/pjpeg": { "compressible": false },
		"image/png": {
			"source": "iana",
			"compressible": false,
			"extensions": ["png"]
		},
		"image/prs.btif": {
			"source": "iana",
			"extensions": ["btif"]
		},
		"image/prs.pti": {
			"source": "iana",
			"extensions": ["pti"]
		},
		"image/pwg-raster": { "source": "iana" },
		"image/sgi": {
			"source": "apache",
			"extensions": ["sgi"]
		},
		"image/svg+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["svg", "svgz"]
		},
		"image/t38": {
			"source": "iana",
			"extensions": ["t38"]
		},
		"image/tiff": {
			"source": "iana",
			"compressible": false,
			"extensions": ["tif", "tiff"]
		},
		"image/tiff-fx": {
			"source": "iana",
			"extensions": ["tfx"]
		},
		"image/vnd.adobe.photoshop": {
			"source": "iana",
			"compressible": true,
			"extensions": ["psd"]
		},
		"image/vnd.airzip.accelerator.azv": {
			"source": "iana",
			"extensions": ["azv"]
		},
		"image/vnd.cns.inf2": { "source": "iana" },
		"image/vnd.dece.graphic": {
			"source": "iana",
			"extensions": [
				"uvi",
				"uvvi",
				"uvg",
				"uvvg"
			]
		},
		"image/vnd.djvu": {
			"source": "iana",
			"extensions": ["djvu", "djv"]
		},
		"image/vnd.dvb.subtitle": {
			"source": "iana",
			"extensions": ["sub"]
		},
		"image/vnd.dwg": {
			"source": "iana",
			"extensions": ["dwg"]
		},
		"image/vnd.dxf": {
			"source": "iana",
			"extensions": ["dxf"]
		},
		"image/vnd.fastbidsheet": {
			"source": "iana",
			"extensions": ["fbs"]
		},
		"image/vnd.fpx": {
			"source": "iana",
			"extensions": ["fpx"]
		},
		"image/vnd.fst": {
			"source": "iana",
			"extensions": ["fst"]
		},
		"image/vnd.fujixerox.edmics-mmr": {
			"source": "iana",
			"extensions": ["mmr"]
		},
		"image/vnd.fujixerox.edmics-rlc": {
			"source": "iana",
			"extensions": ["rlc"]
		},
		"image/vnd.globalgraphics.pgb": { "source": "iana" },
		"image/vnd.microsoft.icon": {
			"source": "iana",
			"compressible": true,
			"extensions": ["ico"]
		},
		"image/vnd.mix": { "source": "iana" },
		"image/vnd.mozilla.apng": { "source": "iana" },
		"image/vnd.ms-dds": {
			"compressible": true,
			"extensions": ["dds"]
		},
		"image/vnd.ms-modi": {
			"source": "iana",
			"extensions": ["mdi"]
		},
		"image/vnd.ms-photo": {
			"source": "apache",
			"extensions": ["wdp"]
		},
		"image/vnd.net-fpx": {
			"source": "iana",
			"extensions": ["npx"]
		},
		"image/vnd.pco.b16": {
			"source": "iana",
			"extensions": ["b16"]
		},
		"image/vnd.radiance": { "source": "iana" },
		"image/vnd.sealed.png": { "source": "iana" },
		"image/vnd.sealedmedia.softseal.gif": { "source": "iana" },
		"image/vnd.sealedmedia.softseal.jpg": { "source": "iana" },
		"image/vnd.svf": { "source": "iana" },
		"image/vnd.tencent.tap": {
			"source": "iana",
			"extensions": ["tap"]
		},
		"image/vnd.valve.source.texture": {
			"source": "iana",
			"extensions": ["vtf"]
		},
		"image/vnd.wap.wbmp": {
			"source": "iana",
			"extensions": ["wbmp"]
		},
		"image/vnd.xiff": {
			"source": "iana",
			"extensions": ["xif"]
		},
		"image/vnd.zbrush.pcx": {
			"source": "iana",
			"extensions": ["pcx"]
		},
		"image/webp": {
			"source": "apache",
			"extensions": ["webp"]
		},
		"image/wmf": {
			"source": "iana",
			"extensions": ["wmf"]
		},
		"image/x-3ds": {
			"source": "apache",
			"extensions": ["3ds"]
		},
		"image/x-cmu-raster": {
			"source": "apache",
			"extensions": ["ras"]
		},
		"image/x-cmx": {
			"source": "apache",
			"extensions": ["cmx"]
		},
		"image/x-freehand": {
			"source": "apache",
			"extensions": [
				"fh",
				"fhc",
				"fh4",
				"fh5",
				"fh7"
			]
		},
		"image/x-icon": {
			"source": "apache",
			"compressible": true,
			"extensions": ["ico"]
		},
		"image/x-jng": {
			"source": "nginx",
			"extensions": ["jng"]
		},
		"image/x-mrsid-image": {
			"source": "apache",
			"extensions": ["sid"]
		},
		"image/x-ms-bmp": {
			"source": "nginx",
			"compressible": true,
			"extensions": ["bmp"]
		},
		"image/x-pcx": {
			"source": "apache",
			"extensions": ["pcx"]
		},
		"image/x-pict": {
			"source": "apache",
			"extensions": ["pic", "pct"]
		},
		"image/x-portable-anymap": {
			"source": "apache",
			"extensions": ["pnm"]
		},
		"image/x-portable-bitmap": {
			"source": "apache",
			"extensions": ["pbm"]
		},
		"image/x-portable-graymap": {
			"source": "apache",
			"extensions": ["pgm"]
		},
		"image/x-portable-pixmap": {
			"source": "apache",
			"extensions": ["ppm"]
		},
		"image/x-rgb": {
			"source": "apache",
			"extensions": ["rgb"]
		},
		"image/x-tga": {
			"source": "apache",
			"extensions": ["tga"]
		},
		"image/x-xbitmap": {
			"source": "apache",
			"extensions": ["xbm"]
		},
		"image/x-xcf": { "compressible": false },
		"image/x-xpixmap": {
			"source": "apache",
			"extensions": ["xpm"]
		},
		"image/x-xwindowdump": {
			"source": "apache",
			"extensions": ["xwd"]
		},
		"message/cpim": { "source": "iana" },
		"message/delivery-status": { "source": "iana" },
		"message/disposition-notification": {
			"source": "iana",
			"extensions": ["disposition-notification"]
		},
		"message/external-body": { "source": "iana" },
		"message/feedback-report": { "source": "iana" },
		"message/global": {
			"source": "iana",
			"extensions": ["u8msg"]
		},
		"message/global-delivery-status": {
			"source": "iana",
			"extensions": ["u8dsn"]
		},
		"message/global-disposition-notification": {
			"source": "iana",
			"extensions": ["u8mdn"]
		},
		"message/global-headers": {
			"source": "iana",
			"extensions": ["u8hdr"]
		},
		"message/http": {
			"source": "iana",
			"compressible": false
		},
		"message/imdn+xml": {
			"source": "iana",
			"compressible": true
		},
		"message/news": { "source": "iana" },
		"message/partial": {
			"source": "iana",
			"compressible": false
		},
		"message/rfc822": {
			"source": "iana",
			"compressible": true,
			"extensions": ["eml", "mime"]
		},
		"message/s-http": { "source": "iana" },
		"message/sip": { "source": "iana" },
		"message/sipfrag": { "source": "iana" },
		"message/tracking-status": { "source": "iana" },
		"message/vnd.si.simp": { "source": "iana" },
		"message/vnd.wfa.wsc": {
			"source": "iana",
			"extensions": ["wsc"]
		},
		"model/3mf": {
			"source": "iana",
			"extensions": ["3mf"]
		},
		"model/e57": { "source": "iana" },
		"model/gltf+json": {
			"source": "iana",
			"compressible": true,
			"extensions": ["gltf"]
		},
		"model/gltf-binary": {
			"source": "iana",
			"compressible": true,
			"extensions": ["glb"]
		},
		"model/iges": {
			"source": "iana",
			"compressible": false,
			"extensions": ["igs", "iges"]
		},
		"model/mesh": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"msh",
				"mesh",
				"silo"
			]
		},
		"model/mtl": {
			"source": "iana",
			"extensions": ["mtl"]
		},
		"model/obj": {
			"source": "iana",
			"extensions": ["obj"]
		},
		"model/step": { "source": "iana" },
		"model/step+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["stpx"]
		},
		"model/step+zip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["stpz"]
		},
		"model/step-xml+zip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["stpxz"]
		},
		"model/stl": {
			"source": "iana",
			"extensions": ["stl"]
		},
		"model/vnd.collada+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["dae"]
		},
		"model/vnd.dwf": {
			"source": "iana",
			"extensions": ["dwf"]
		},
		"model/vnd.flatland.3dml": { "source": "iana" },
		"model/vnd.gdl": {
			"source": "iana",
			"extensions": ["gdl"]
		},
		"model/vnd.gs-gdl": { "source": "apache" },
		"model/vnd.gs.gdl": { "source": "iana" },
		"model/vnd.gtw": {
			"source": "iana",
			"extensions": ["gtw"]
		},
		"model/vnd.moml+xml": {
			"source": "iana",
			"compressible": true
		},
		"model/vnd.mts": {
			"source": "iana",
			"extensions": ["mts"]
		},
		"model/vnd.opengex": {
			"source": "iana",
			"extensions": ["ogex"]
		},
		"model/vnd.parasolid.transmit.binary": {
			"source": "iana",
			"extensions": ["x_b"]
		},
		"model/vnd.parasolid.transmit.text": {
			"source": "iana",
			"extensions": ["x_t"]
		},
		"model/vnd.pytha.pyox": { "source": "iana" },
		"model/vnd.rosette.annotated-data-model": { "source": "iana" },
		"model/vnd.sap.vds": {
			"source": "iana",
			"extensions": ["vds"]
		},
		"model/vnd.usdz+zip": {
			"source": "iana",
			"compressible": false,
			"extensions": ["usdz"]
		},
		"model/vnd.valve.source.compiled-map": {
			"source": "iana",
			"extensions": ["bsp"]
		},
		"model/vnd.vtu": {
			"source": "iana",
			"extensions": ["vtu"]
		},
		"model/vrml": {
			"source": "iana",
			"compressible": false,
			"extensions": ["wrl", "vrml"]
		},
		"model/x3d+binary": {
			"source": "apache",
			"compressible": false,
			"extensions": ["x3db", "x3dbz"]
		},
		"model/x3d+fastinfoset": {
			"source": "iana",
			"extensions": ["x3db"]
		},
		"model/x3d+vrml": {
			"source": "apache",
			"compressible": false,
			"extensions": ["x3dv", "x3dvz"]
		},
		"model/x3d+xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["x3d", "x3dz"]
		},
		"model/x3d-vrml": {
			"source": "iana",
			"extensions": ["x3dv"]
		},
		"multipart/alternative": {
			"source": "iana",
			"compressible": false
		},
		"multipart/appledouble": { "source": "iana" },
		"multipart/byteranges": { "source": "iana" },
		"multipart/digest": { "source": "iana" },
		"multipart/encrypted": {
			"source": "iana",
			"compressible": false
		},
		"multipart/form-data": {
			"source": "iana",
			"compressible": false
		},
		"multipart/header-set": { "source": "iana" },
		"multipart/mixed": { "source": "iana" },
		"multipart/multilingual": { "source": "iana" },
		"multipart/parallel": { "source": "iana" },
		"multipart/related": {
			"source": "iana",
			"compressible": false
		},
		"multipart/report": { "source": "iana" },
		"multipart/signed": {
			"source": "iana",
			"compressible": false
		},
		"multipart/vnd.bint.med-plus": { "source": "iana" },
		"multipart/voice-message": { "source": "iana" },
		"multipart/x-mixed-replace": { "source": "iana" },
		"text/1d-interleaved-parityfec": { "source": "iana" },
		"text/cache-manifest": {
			"source": "iana",
			"compressible": true,
			"extensions": ["appcache", "manifest"]
		},
		"text/calendar": {
			"source": "iana",
			"extensions": ["ics", "ifb"]
		},
		"text/calender": { "compressible": true },
		"text/cmd": { "compressible": true },
		"text/coffeescript": { "extensions": ["coffee", "litcoffee"] },
		"text/cql": { "source": "iana" },
		"text/cql-expression": { "source": "iana" },
		"text/cql-identifier": { "source": "iana" },
		"text/css": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["css"]
		},
		"text/csv": {
			"source": "iana",
			"compressible": true,
			"extensions": ["csv"]
		},
		"text/csv-schema": { "source": "iana" },
		"text/directory": { "source": "iana" },
		"text/dns": { "source": "iana" },
		"text/ecmascript": { "source": "iana" },
		"text/encaprtp": { "source": "iana" },
		"text/enriched": { "source": "iana" },
		"text/fhirpath": { "source": "iana" },
		"text/flexfec": { "source": "iana" },
		"text/fwdred": { "source": "iana" },
		"text/gff3": { "source": "iana" },
		"text/grammar-ref-list": { "source": "iana" },
		"text/html": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"html",
				"htm",
				"shtml"
			]
		},
		"text/jade": { "extensions": ["jade"] },
		"text/javascript": {
			"source": "iana",
			"compressible": true
		},
		"text/jcr-cnd": { "source": "iana" },
		"text/jsx": {
			"compressible": true,
			"extensions": ["jsx"]
		},
		"text/less": {
			"compressible": true,
			"extensions": ["less"]
		},
		"text/markdown": {
			"source": "iana",
			"compressible": true,
			"extensions": ["markdown", "md"]
		},
		"text/mathml": {
			"source": "nginx",
			"extensions": ["mml"]
		},
		"text/mdx": {
			"compressible": true,
			"extensions": ["mdx"]
		},
		"text/mizar": { "source": "iana" },
		"text/n3": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["n3"]
		},
		"text/parameters": {
			"source": "iana",
			"charset": "UTF-8"
		},
		"text/parityfec": { "source": "iana" },
		"text/plain": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"txt",
				"text",
				"conf",
				"def",
				"list",
				"log",
				"in",
				"ini"
			]
		},
		"text/provenance-notation": {
			"source": "iana",
			"charset": "UTF-8"
		},
		"text/prs.fallenstein.rst": { "source": "iana" },
		"text/prs.lines.tag": {
			"source": "iana",
			"extensions": ["dsc"]
		},
		"text/prs.prop.logic": { "source": "iana" },
		"text/raptorfec": { "source": "iana" },
		"text/red": { "source": "iana" },
		"text/rfc822-headers": { "source": "iana" },
		"text/richtext": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rtx"]
		},
		"text/rtf": {
			"source": "iana",
			"compressible": true,
			"extensions": ["rtf"]
		},
		"text/rtp-enc-aescm128": { "source": "iana" },
		"text/rtploopback": { "source": "iana" },
		"text/rtx": { "source": "iana" },
		"text/sgml": {
			"source": "iana",
			"extensions": ["sgml", "sgm"]
		},
		"text/shaclc": { "source": "iana" },
		"text/shex": {
			"source": "iana",
			"extensions": ["shex"]
		},
		"text/slim": { "extensions": ["slim", "slm"] },
		"text/spdx": {
			"source": "iana",
			"extensions": ["spdx"]
		},
		"text/strings": { "source": "iana" },
		"text/stylus": { "extensions": ["stylus", "styl"] },
		"text/t140": { "source": "iana" },
		"text/tab-separated-values": {
			"source": "iana",
			"compressible": true,
			"extensions": ["tsv"]
		},
		"text/troff": {
			"source": "iana",
			"extensions": [
				"t",
				"tr",
				"roff",
				"man",
				"me",
				"ms"
			]
		},
		"text/turtle": {
			"source": "iana",
			"charset": "UTF-8",
			"extensions": ["ttl"]
		},
		"text/ulpfec": { "source": "iana" },
		"text/uri-list": {
			"source": "iana",
			"compressible": true,
			"extensions": [
				"uri",
				"uris",
				"urls"
			]
		},
		"text/vcard": {
			"source": "iana",
			"compressible": true,
			"extensions": ["vcard"]
		},
		"text/vnd.a": { "source": "iana" },
		"text/vnd.abc": { "source": "iana" },
		"text/vnd.ascii-art": { "source": "iana" },
		"text/vnd.curl": {
			"source": "iana",
			"extensions": ["curl"]
		},
		"text/vnd.curl.dcurl": {
			"source": "apache",
			"extensions": ["dcurl"]
		},
		"text/vnd.curl.mcurl": {
			"source": "apache",
			"extensions": ["mcurl"]
		},
		"text/vnd.curl.scurl": {
			"source": "apache",
			"extensions": ["scurl"]
		},
		"text/vnd.debian.copyright": {
			"source": "iana",
			"charset": "UTF-8"
		},
		"text/vnd.dmclientscript": { "source": "iana" },
		"text/vnd.dvb.subtitle": {
			"source": "iana",
			"extensions": ["sub"]
		},
		"text/vnd.esmertec.theme-descriptor": {
			"source": "iana",
			"charset": "UTF-8"
		},
		"text/vnd.familysearch.gedcom": {
			"source": "iana",
			"extensions": ["ged"]
		},
		"text/vnd.ficlab.flt": { "source": "iana" },
		"text/vnd.fly": {
			"source": "iana",
			"extensions": ["fly"]
		},
		"text/vnd.fmi.flexstor": {
			"source": "iana",
			"extensions": ["flx"]
		},
		"text/vnd.gml": { "source": "iana" },
		"text/vnd.graphviz": {
			"source": "iana",
			"extensions": ["gv"]
		},
		"text/vnd.hans": { "source": "iana" },
		"text/vnd.hgl": { "source": "iana" },
		"text/vnd.in3d.3dml": {
			"source": "iana",
			"extensions": ["3dml"]
		},
		"text/vnd.in3d.spot": {
			"source": "iana",
			"extensions": ["spot"]
		},
		"text/vnd.iptc.newsml": { "source": "iana" },
		"text/vnd.iptc.nitf": { "source": "iana" },
		"text/vnd.latex-z": { "source": "iana" },
		"text/vnd.motorola.reflex": { "source": "iana" },
		"text/vnd.ms-mediapackage": { "source": "iana" },
		"text/vnd.net2phone.commcenter.command": { "source": "iana" },
		"text/vnd.radisys.msml-basic-layout": { "source": "iana" },
		"text/vnd.senx.warpscript": { "source": "iana" },
		"text/vnd.si.uricatalogue": { "source": "iana" },
		"text/vnd.sosi": { "source": "iana" },
		"text/vnd.sun.j2me.app-descriptor": {
			"source": "iana",
			"charset": "UTF-8",
			"extensions": ["jad"]
		},
		"text/vnd.trolltech.linguist": {
			"source": "iana",
			"charset": "UTF-8"
		},
		"text/vnd.wap.si": { "source": "iana" },
		"text/vnd.wap.sl": { "source": "iana" },
		"text/vnd.wap.wml": {
			"source": "iana",
			"extensions": ["wml"]
		},
		"text/vnd.wap.wmlscript": {
			"source": "iana",
			"extensions": ["wmls"]
		},
		"text/vtt": {
			"source": "iana",
			"charset": "UTF-8",
			"compressible": true,
			"extensions": ["vtt"]
		},
		"text/x-asm": {
			"source": "apache",
			"extensions": ["s", "asm"]
		},
		"text/x-c": {
			"source": "apache",
			"extensions": [
				"c",
				"cc",
				"cxx",
				"cpp",
				"h",
				"hh",
				"dic"
			]
		},
		"text/x-component": {
			"source": "nginx",
			"extensions": ["htc"]
		},
		"text/x-fortran": {
			"source": "apache",
			"extensions": [
				"f",
				"for",
				"f77",
				"f90"
			]
		},
		"text/x-gwt-rpc": { "compressible": true },
		"text/x-handlebars-template": { "extensions": ["hbs"] },
		"text/x-java-source": {
			"source": "apache",
			"extensions": ["java"]
		},
		"text/x-jquery-tmpl": { "compressible": true },
		"text/x-lua": { "extensions": ["lua"] },
		"text/x-markdown": {
			"compressible": true,
			"extensions": ["mkd"]
		},
		"text/x-nfo": {
			"source": "apache",
			"extensions": ["nfo"]
		},
		"text/x-opml": {
			"source": "apache",
			"extensions": ["opml"]
		},
		"text/x-org": {
			"compressible": true,
			"extensions": ["org"]
		},
		"text/x-pascal": {
			"source": "apache",
			"extensions": ["p", "pas"]
		},
		"text/x-processing": {
			"compressible": true,
			"extensions": ["pde"]
		},
		"text/x-sass": { "extensions": ["sass"] },
		"text/x-scss": { "extensions": ["scss"] },
		"text/x-setext": {
			"source": "apache",
			"extensions": ["etx"]
		},
		"text/x-sfv": {
			"source": "apache",
			"extensions": ["sfv"]
		},
		"text/x-suse-ymp": {
			"compressible": true,
			"extensions": ["ymp"]
		},
		"text/x-uuencode": {
			"source": "apache",
			"extensions": ["uu"]
		},
		"text/x-vcalendar": {
			"source": "apache",
			"extensions": ["vcs"]
		},
		"text/x-vcard": {
			"source": "apache",
			"extensions": ["vcf"]
		},
		"text/xml": {
			"source": "iana",
			"compressible": true,
			"extensions": ["xml"]
		},
		"text/xml-external-parsed-entity": { "source": "iana" },
		"text/yaml": {
			"compressible": true,
			"extensions": ["yaml", "yml"]
		},
		"video/1d-interleaved-parityfec": { "source": "iana" },
		"video/3gpp": {
			"source": "iana",
			"extensions": ["3gp", "3gpp"]
		},
		"video/3gpp-tt": { "source": "iana" },
		"video/3gpp2": {
			"source": "iana",
			"extensions": ["3g2"]
		},
		"video/av1": { "source": "iana" },
		"video/bmpeg": { "source": "iana" },
		"video/bt656": { "source": "iana" },
		"video/celb": { "source": "iana" },
		"video/dv": { "source": "iana" },
		"video/encaprtp": { "source": "iana" },
		"video/ffv1": { "source": "iana" },
		"video/flexfec": { "source": "iana" },
		"video/h261": {
			"source": "iana",
			"extensions": ["h261"]
		},
		"video/h263": {
			"source": "iana",
			"extensions": ["h263"]
		},
		"video/h263-1998": { "source": "iana" },
		"video/h263-2000": { "source": "iana" },
		"video/h264": {
			"source": "iana",
			"extensions": ["h264"]
		},
		"video/h264-rcdo": { "source": "iana" },
		"video/h264-svc": { "source": "iana" },
		"video/h265": { "source": "iana" },
		"video/iso.segment": {
			"source": "iana",
			"extensions": ["m4s"]
		},
		"video/jpeg": {
			"source": "iana",
			"extensions": ["jpgv"]
		},
		"video/jpeg2000": { "source": "iana" },
		"video/jpm": {
			"source": "apache",
			"extensions": ["jpm", "jpgm"]
		},
		"video/jxsv": { "source": "iana" },
		"video/mj2": {
			"source": "iana",
			"extensions": ["mj2", "mjp2"]
		},
		"video/mp1s": { "source": "iana" },
		"video/mp2p": { "source": "iana" },
		"video/mp2t": {
			"source": "iana",
			"extensions": ["ts"]
		},
		"video/mp4": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"mp4",
				"mp4v",
				"mpg4"
			]
		},
		"video/mp4v-es": { "source": "iana" },
		"video/mpeg": {
			"source": "iana",
			"compressible": false,
			"extensions": [
				"mpeg",
				"mpg",
				"mpe",
				"m1v",
				"m2v"
			]
		},
		"video/mpeg4-generic": { "source": "iana" },
		"video/mpv": { "source": "iana" },
		"video/nv": { "source": "iana" },
		"video/ogg": {
			"source": "iana",
			"compressible": false,
			"extensions": ["ogv"]
		},
		"video/parityfec": { "source": "iana" },
		"video/pointer": { "source": "iana" },
		"video/quicktime": {
			"source": "iana",
			"compressible": false,
			"extensions": ["qt", "mov"]
		},
		"video/raptorfec": { "source": "iana" },
		"video/raw": { "source": "iana" },
		"video/rtp-enc-aescm128": { "source": "iana" },
		"video/rtploopback": { "source": "iana" },
		"video/rtx": { "source": "iana" },
		"video/scip": { "source": "iana" },
		"video/smpte291": { "source": "iana" },
		"video/smpte292m": { "source": "iana" },
		"video/ulpfec": { "source": "iana" },
		"video/vc1": { "source": "iana" },
		"video/vc2": { "source": "iana" },
		"video/vnd.cctv": { "source": "iana" },
		"video/vnd.dece.hd": {
			"source": "iana",
			"extensions": ["uvh", "uvvh"]
		},
		"video/vnd.dece.mobile": {
			"source": "iana",
			"extensions": ["uvm", "uvvm"]
		},
		"video/vnd.dece.mp4": { "source": "iana" },
		"video/vnd.dece.pd": {
			"source": "iana",
			"extensions": ["uvp", "uvvp"]
		},
		"video/vnd.dece.sd": {
			"source": "iana",
			"extensions": ["uvs", "uvvs"]
		},
		"video/vnd.dece.video": {
			"source": "iana",
			"extensions": ["uvv", "uvvv"]
		},
		"video/vnd.directv.mpeg": { "source": "iana" },
		"video/vnd.directv.mpeg-tts": { "source": "iana" },
		"video/vnd.dlna.mpeg-tts": { "source": "iana" },
		"video/vnd.dvb.file": {
			"source": "iana",
			"extensions": ["dvb"]
		},
		"video/vnd.fvt": {
			"source": "iana",
			"extensions": ["fvt"]
		},
		"video/vnd.hns.video": { "source": "iana" },
		"video/vnd.iptvforum.1dparityfec-1010": { "source": "iana" },
		"video/vnd.iptvforum.1dparityfec-2005": { "source": "iana" },
		"video/vnd.iptvforum.2dparityfec-1010": { "source": "iana" },
		"video/vnd.iptvforum.2dparityfec-2005": { "source": "iana" },
		"video/vnd.iptvforum.ttsavc": { "source": "iana" },
		"video/vnd.iptvforum.ttsmpeg2": { "source": "iana" },
		"video/vnd.motorola.video": { "source": "iana" },
		"video/vnd.motorola.videop": { "source": "iana" },
		"video/vnd.mpegurl": {
			"source": "iana",
			"extensions": ["mxu", "m4u"]
		},
		"video/vnd.ms-playready.media.pyv": {
			"source": "iana",
			"extensions": ["pyv"]
		},
		"video/vnd.nokia.interleaved-multimedia": { "source": "iana" },
		"video/vnd.nokia.mp4vr": { "source": "iana" },
		"video/vnd.nokia.videovoip": { "source": "iana" },
		"video/vnd.objectvideo": { "source": "iana" },
		"video/vnd.radgamettools.bink": { "source": "iana" },
		"video/vnd.radgamettools.smacker": { "source": "iana" },
		"video/vnd.sealed.mpeg1": { "source": "iana" },
		"video/vnd.sealed.mpeg4": { "source": "iana" },
		"video/vnd.sealed.swf": { "source": "iana" },
		"video/vnd.sealedmedia.softseal.mov": { "source": "iana" },
		"video/vnd.uvvu.mp4": {
			"source": "iana",
			"extensions": ["uvu", "uvvu"]
		},
		"video/vnd.vivo": {
			"source": "iana",
			"extensions": ["viv"]
		},
		"video/vnd.youtube.yt": { "source": "iana" },
		"video/vp8": { "source": "iana" },
		"video/vp9": { "source": "iana" },
		"video/webm": {
			"source": "apache",
			"compressible": false,
			"extensions": ["webm"]
		},
		"video/x-f4v": {
			"source": "apache",
			"extensions": ["f4v"]
		},
		"video/x-fli": {
			"source": "apache",
			"extensions": ["fli"]
		},
		"video/x-flv": {
			"source": "apache",
			"compressible": false,
			"extensions": ["flv"]
		},
		"video/x-m4v": {
			"source": "apache",
			"extensions": ["m4v"]
		},
		"video/x-matroska": {
			"source": "apache",
			"compressible": false,
			"extensions": [
				"mkv",
				"mk3d",
				"mks"
			]
		},
		"video/x-mng": {
			"source": "apache",
			"extensions": ["mng"]
		},
		"video/x-ms-asf": {
			"source": "apache",
			"extensions": ["asf", "asx"]
		},
		"video/x-ms-vob": {
			"source": "apache",
			"extensions": ["vob"]
		},
		"video/x-ms-wm": {
			"source": "apache",
			"extensions": ["wm"]
		},
		"video/x-ms-wmv": {
			"source": "apache",
			"compressible": false,
			"extensions": ["wmv"]
		},
		"video/x-ms-wmx": {
			"source": "apache",
			"extensions": ["wmx"]
		},
		"video/x-ms-wvx": {
			"source": "apache",
			"extensions": ["wvx"]
		},
		"video/x-msvideo": {
			"source": "apache",
			"extensions": ["avi"]
		},
		"video/x-sgi-movie": {
			"source": "apache",
			"extensions": ["movie"]
		},
		"video/x-smv": {
			"source": "apache",
			"extensions": ["smv"]
		},
		"x-conference/x-cooltalk": {
			"source": "apache",
			"extensions": ["ice"]
		},
		"x-shader/x-fragment": { "compressible": true },
		"x-shader/x-vertex": { "compressible": true }
	};
}));
//#endregion
//#region node_modules/mime-db/index.js
var require_mime_db = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/*!
	* mime-db
	* Copyright(c) 2014 Jonathan Ong
	* Copyright(c) 2015-2022 Douglas Christopher Wilson
	* MIT Licensed
	*/
	/**
	* Module exports.
	*/
	module.exports = (init_db(), __toCommonJS(db_exports).default);
}));
//#endregion
//#region node_modules/mime-types/index.js
/*!
* mime-types
* Copyright(c) 2014 Jonathan Ong
* Copyright(c) 2015 Douglas Christopher Wilson
* MIT Licensed
*/
var require_mime_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Module dependencies.
	* @private
	*/
	var db = require_mime_db();
	var extname = require("path").extname;
	/**
	* Module variables.
	* @private
	*/
	var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
	var TEXT_TYPE_REGEXP = /^text\//i;
	/**
	* Module exports.
	* @public
	*/
	exports.charset = charset;
	exports.charsets = { lookup: charset };
	exports.contentType = contentType;
	exports.extension = extension;
	exports.extensions = Object.create(null);
	exports.lookup = lookup;
	exports.types = Object.create(null);
	populateMaps(exports.extensions, exports.types);
	/**
	* Get the default charset for a MIME type.
	*
	* @param {string} type
	* @return {boolean|string}
	*/
	function charset(type) {
		if (!type || typeof type !== "string") return false;
		var match = EXTRACT_TYPE_REGEXP.exec(type);
		var mime = match && db[match[1].toLowerCase()];
		if (mime && mime.charset) return mime.charset;
		if (match && TEXT_TYPE_REGEXP.test(match[1])) return "UTF-8";
		return false;
	}
	/**
	* Create a full Content-Type header given a MIME type or extension.
	*
	* @param {string} str
	* @return {boolean|string}
	*/
	function contentType(str) {
		if (!str || typeof str !== "string") return false;
		var mime = str.indexOf("/") === -1 ? exports.lookup(str) : str;
		if (!mime) return false;
		if (mime.indexOf("charset") === -1) {
			var charset = exports.charset(mime);
			if (charset) mime += "; charset=" + charset.toLowerCase();
		}
		return mime;
	}
	/**
	* Get the default extension for a MIME type.
	*
	* @param {string} type
	* @return {boolean|string}
	*/
	function extension(type) {
		if (!type || typeof type !== "string") return false;
		var match = EXTRACT_TYPE_REGEXP.exec(type);
		var exts = match && exports.extensions[match[1].toLowerCase()];
		if (!exts || !exts.length) return false;
		return exts[0];
	}
	/**
	* Lookup the MIME type for a file path/extension.
	*
	* @param {string} path
	* @return {boolean|string}
	*/
	function lookup(path) {
		if (!path || typeof path !== "string") return false;
		var extension = extname("x." + path).toLowerCase().substr(1);
		if (!extension) return false;
		return exports.types[extension] || false;
	}
	/**
	* Populate the extensions and types maps.
	* @private
	*/
	function populateMaps(extensions, types) {
		var preference = [
			"nginx",
			"apache",
			void 0,
			"iana"
		];
		Object.keys(db).forEach(function forEachMimeType(type) {
			var mime = db[type];
			var exts = mime.extensions;
			if (!exts || !exts.length) return;
			extensions[type] = exts;
			for (var i = 0; i < exts.length; i++) {
				var extension = exts[i];
				if (types[extension]) {
					var from = preference.indexOf(db[types[extension]].source);
					var to = preference.indexOf(mime.source);
					if (types[extension] !== "application/octet-stream" && (from > to || from === to && types[extension].substr(0, 12) === "application/")) continue;
				}
				types[extension] = type;
			}
		});
	}
}));
//#endregion
//#region node_modules/accepts/index.js
/*!
* accepts
* Copyright(c) 2014 Jonathan Ong
* Copyright(c) 2015 Douglas Christopher Wilson
* MIT Licensed
*/
var require_accepts = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Module dependencies.
	* @private
	*/
	var Negotiator = require_negotiator();
	var mime = require_mime_types();
	/**
	* Module exports.
	* @public
	*/
	module.exports = Accepts;
	/**
	* Create a new Accepts object for the given req.
	*
	* @param {object} req
	* @public
	*/
	function Accepts(req) {
		if (!(this instanceof Accepts)) return new Accepts(req);
		this.headers = req.headers;
		this.negotiator = new Negotiator(req);
	}
	/**
	* Check if the given `type(s)` is acceptable, returning
	* the best match when true, otherwise `undefined`, in which
	* case you should respond with 406 "Not Acceptable".
	*
	* The `type` value may be a single mime type string
	* such as "application/json", the extension name
	* such as "json" or an array `["json", "html", "text/plain"]`. When a list
	* or array is given the _best_ match, if any is returned.
	*
	* Examples:
	*
	*     // Accept: text/html
	*     this.types('html');
	*     // => "html"
	*
	*     // Accept: text/*, application/json
	*     this.types('html');
	*     // => "html"
	*     this.types('text/html');
	*     // => "text/html"
	*     this.types('json', 'text');
	*     // => "json"
	*     this.types('application/json');
	*     // => "application/json"
	*
	*     // Accept: text/*, application/json
	*     this.types('image/png');
	*     this.types('png');
	*     // => undefined
	*
	*     // Accept: text/*;q=.5, application/json
	*     this.types(['html', 'json']);
	*     this.types('html', 'json');
	*     // => "json"
	*
	* @param {String|Array} types...
	* @return {String|Array|Boolean}
	* @public
	*/
	Accepts.prototype.type = Accepts.prototype.types = function(types_) {
		var types = types_;
		if (types && !Array.isArray(types)) {
			types = new Array(arguments.length);
			for (var i = 0; i < types.length; i++) types[i] = arguments[i];
		}
		if (!types || types.length === 0) return this.negotiator.mediaTypes();
		if (!this.headers.accept) return types[0];
		var mimes = types.map(extToMime);
		var first = this.negotiator.mediaTypes(mimes.filter(validMime))[0];
		return first ? types[mimes.indexOf(first)] : false;
	};
	/**
	* Return accepted encodings or best fit based on `encodings`.
	*
	* Given `Accept-Encoding: gzip, deflate`
	* an array sorted by quality is returned:
	*
	*     ['gzip', 'deflate']
	*
	* @param {String|Array} encodings...
	* @return {String|Array}
	* @public
	*/
	Accepts.prototype.encoding = Accepts.prototype.encodings = function(encodings_) {
		var encodings = encodings_;
		if (encodings && !Array.isArray(encodings)) {
			encodings = new Array(arguments.length);
			for (var i = 0; i < encodings.length; i++) encodings[i] = arguments[i];
		}
		if (!encodings || encodings.length === 0) return this.negotiator.encodings();
		return this.negotiator.encodings(encodings)[0] || false;
	};
	/**
	* Return accepted charsets or best fit based on `charsets`.
	*
	* Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
	* an array sorted by quality is returned:
	*
	*     ['utf-8', 'utf-7', 'iso-8859-1']
	*
	* @param {String|Array} charsets...
	* @return {String|Array}
	* @public
	*/
	Accepts.prototype.charset = Accepts.prototype.charsets = function(charsets_) {
		var charsets = charsets_;
		if (charsets && !Array.isArray(charsets)) {
			charsets = new Array(arguments.length);
			for (var i = 0; i < charsets.length; i++) charsets[i] = arguments[i];
		}
		if (!charsets || charsets.length === 0) return this.negotiator.charsets();
		return this.negotiator.charsets(charsets)[0] || false;
	};
	/**
	* Return accepted languages or best fit based on `langs`.
	*
	* Given `Accept-Language: en;q=0.8, es, pt`
	* an array sorted by quality is returned:
	*
	*     ['es', 'pt', 'en']
	*
	* @param {String|Array} langs...
	* @return {Array|String}
	* @public
	*/
	Accepts.prototype.lang = Accepts.prototype.langs = Accepts.prototype.language = Accepts.prototype.languages = function(languages_) {
		var languages = languages_;
		if (languages && !Array.isArray(languages)) {
			languages = new Array(arguments.length);
			for (var i = 0; i < languages.length; i++) languages[i] = arguments[i];
		}
		if (!languages || languages.length === 0) return this.negotiator.languages();
		return this.negotiator.languages(languages)[0] || false;
	};
	/**
	* Convert extnames to mime.
	*
	* @param {String} type
	* @return {String}
	* @private
	*/
	function extToMime(type) {
		return type.indexOf("/") === -1 ? mime.lookup(type) : type;
	}
	/**
	* Check if mime is valid.
	*
	* @param {String} type
	* @return {String}
	* @private
	*/
	function validMime(type) {
		return typeof type === "string";
	}
}));
//#endregion
//#region node_modules/base64id/lib/base64id.js
var require_base64id = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/*!
	* base64id v0.1.0
	*/
	/**
	* Module dependencies
	*/
	var crypto = require("crypto");
	/**
	* Constructor
	*/
	var Base64Id = function() {};
	/**
	* Get random bytes
	*
	* Uses a buffer if available, falls back to crypto.randomBytes
	*/
	Base64Id.prototype.getRandomBytes = function(bytes) {
		var BUFFER_SIZE = 4096;
		var self = this;
		bytes = bytes || 12;
		if (bytes > BUFFER_SIZE) return crypto.randomBytes(bytes);
		var bytesInBuffer = parseInt(BUFFER_SIZE / bytes);
		var threshold = parseInt(bytesInBuffer * .85);
		if (!threshold) return crypto.randomBytes(bytes);
		if (this.bytesBufferIndex == null) this.bytesBufferIndex = -1;
		if (this.bytesBufferIndex == bytesInBuffer) {
			this.bytesBuffer = null;
			this.bytesBufferIndex = -1;
		}
		if (this.bytesBufferIndex == -1 || this.bytesBufferIndex > threshold) {
			if (!this.isGeneratingBytes) {
				this.isGeneratingBytes = true;
				crypto.randomBytes(BUFFER_SIZE, function(err, bytes) {
					self.bytesBuffer = bytes;
					self.bytesBufferIndex = 0;
					self.isGeneratingBytes = false;
				});
			}
			if (this.bytesBufferIndex == -1) return crypto.randomBytes(bytes);
		}
		var result = this.bytesBuffer.slice(bytes * this.bytesBufferIndex, bytes * (this.bytesBufferIndex + 1));
		this.bytesBufferIndex++;
		return result;
	};
	/**
	* Generates a base64 id
	*
	* (Original version from socket.io <http://socket.io>)
	*/
	Base64Id.prototype.generateId = function() {
		var rand = Buffer.alloc(15);
		if (!rand.writeInt32BE) return Math.abs(Math.random() * Math.random() * Date.now() | 0).toString() + Math.abs(Math.random() * Math.random() * Date.now() | 0).toString();
		this.sequenceNumber = this.sequenceNumber + 1 | 0;
		rand.writeInt32BE(this.sequenceNumber, 11);
		if (crypto.randomBytes) this.getRandomBytes(12).copy(rand);
		else [
			0,
			4,
			8
		].forEach(function(i) {
			rand.writeInt32BE(Math.random() * Math.pow(2, 32) | 0, i);
		});
		return rand.toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
	};
	/**
	* Export
	*/
	exports = module.exports = new Base64Id();
}));
//#endregion
//#region node_modules/engine.io-parser/build/cjs/commons.js
var require_commons = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ERROR_PACKET = exports.PACKET_TYPES_REVERSE = exports.PACKET_TYPES = void 0;
	var PACKET_TYPES = Object.create(null);
	exports.PACKET_TYPES = PACKET_TYPES;
	PACKET_TYPES["open"] = "0";
	PACKET_TYPES["close"] = "1";
	PACKET_TYPES["ping"] = "2";
	PACKET_TYPES["pong"] = "3";
	PACKET_TYPES["message"] = "4";
	PACKET_TYPES["upgrade"] = "5";
	PACKET_TYPES["noop"] = "6";
	var PACKET_TYPES_REVERSE = Object.create(null);
	exports.PACKET_TYPES_REVERSE = PACKET_TYPES_REVERSE;
	Object.keys(PACKET_TYPES).forEach((key) => {
		PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
	});
	exports.ERROR_PACKET = {
		type: "error",
		data: "parser error"
	};
}));
//#endregion
//#region node_modules/engine.io-parser/build/cjs/encodePacket.js
var require_encodePacket = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encodePacket = void 0;
	exports.encodePacketToBinary = encodePacketToBinary;
	var commons_js_1 = require_commons();
	var encodePacket = ({ type, data }, supportsBinary, callback) => {
		if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) return callback(supportsBinary ? data : "b" + toBuffer(data, true).toString("base64"));
		return callback(commons_js_1.PACKET_TYPES[type] + (data || ""));
	};
	exports.encodePacket = encodePacket;
	var toBuffer = (data, forceBufferConversion) => {
		if (Buffer.isBuffer(data) || data instanceof Uint8Array && !forceBufferConversion) return data;
		else if (data instanceof ArrayBuffer) return Buffer.from(data);
		else return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	};
	var TEXT_ENCODER;
	function encodePacketToBinary(packet, callback) {
		if (packet.data instanceof ArrayBuffer || ArrayBuffer.isView(packet.data)) return callback(toBuffer(packet.data, false));
		(0, exports.encodePacket)(packet, true, (encoded) => {
			if (!TEXT_ENCODER) TEXT_ENCODER = new TextEncoder();
			callback(TEXT_ENCODER.encode(encoded));
		});
	}
}));
//#endregion
//#region node_modules/engine.io-parser/build/cjs/decodePacket.js
var require_decodePacket = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decodePacket = void 0;
	var commons_js_1 = require_commons();
	var decodePacket = (encodedPacket, binaryType) => {
		if (typeof encodedPacket !== "string") return {
			type: "message",
			data: mapBinary(encodedPacket, binaryType)
		};
		const type = encodedPacket.charAt(0);
		if (type === "b") return {
			type: "message",
			data: mapBinary(Buffer.from(encodedPacket.substring(1), "base64"), binaryType)
		};
		if (!commons_js_1.PACKET_TYPES_REVERSE[type]) return commons_js_1.ERROR_PACKET;
		return encodedPacket.length > 1 ? {
			type: commons_js_1.PACKET_TYPES_REVERSE[type],
			data: encodedPacket.substring(1)
		} : { type: commons_js_1.PACKET_TYPES_REVERSE[type] };
	};
	exports.decodePacket = decodePacket;
	var mapBinary = (data, binaryType) => {
		switch (binaryType) {
			case "arraybuffer": if (data instanceof ArrayBuffer) return data;
			else if (Buffer.isBuffer(data)) return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			else return data.buffer;
			default: if (Buffer.isBuffer(data)) return data;
			else return Buffer.from(data);
		}
	};
}));
//#endregion
//#region node_modules/engine.io-parser/build/cjs/index.js
var require_cjs$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decodePayload = exports.decodePacket = exports.encodePayload = exports.encodePacket = exports.protocol = void 0;
	exports.createPacketEncoderStream = createPacketEncoderStream;
	exports.createPacketDecoderStream = createPacketDecoderStream;
	var encodePacket_js_1 = require_encodePacket();
	Object.defineProperty(exports, "encodePacket", {
		enumerable: true,
		get: function() {
			return encodePacket_js_1.encodePacket;
		}
	});
	var decodePacket_js_1 = require_decodePacket();
	Object.defineProperty(exports, "decodePacket", {
		enumerable: true,
		get: function() {
			return decodePacket_js_1.decodePacket;
		}
	});
	var commons_js_1 = require_commons();
	var SEPARATOR = String.fromCharCode(30);
	var encodePayload = (packets, callback) => {
		const length = packets.length;
		const encodedPackets = new Array(length);
		let count = 0;
		packets.forEach((packet, i) => {
			(0, encodePacket_js_1.encodePacket)(packet, false, (encodedPacket) => {
				encodedPackets[i] = encodedPacket;
				if (++count === length) callback(encodedPackets.join(SEPARATOR));
			});
		});
	};
	exports.encodePayload = encodePayload;
	var decodePayload = (encodedPayload, binaryType) => {
		const encodedPackets = encodedPayload.split(SEPARATOR);
		const packets = [];
		for (let i = 0; i < encodedPackets.length; i++) {
			const decodedPacket = (0, decodePacket_js_1.decodePacket)(encodedPackets[i], binaryType);
			packets.push(decodedPacket);
			if (decodedPacket.type === "error") break;
		}
		return packets;
	};
	exports.decodePayload = decodePayload;
	function createPacketEncoderStream() {
		return new TransformStream({ transform(packet, controller) {
			(0, encodePacket_js_1.encodePacketToBinary)(packet, (encodedPacket) => {
				const payloadLength = encodedPacket.length;
				let header;
				if (payloadLength < 126) {
					header = /* @__PURE__ */ new Uint8Array(1);
					new DataView(header.buffer).setUint8(0, payloadLength);
				} else if (payloadLength < 65536) {
					header = /* @__PURE__ */ new Uint8Array(3);
					const view = new DataView(header.buffer);
					view.setUint8(0, 126);
					view.setUint16(1, payloadLength);
				} else {
					header = /* @__PURE__ */ new Uint8Array(9);
					const view = new DataView(header.buffer);
					view.setUint8(0, 127);
					view.setBigUint64(1, BigInt(payloadLength));
				}
				if (packet.data && typeof packet.data !== "string") header[0] |= 128;
				controller.enqueue(header);
				controller.enqueue(encodedPacket);
			});
		} });
	}
	var TEXT_DECODER;
	function totalLength(chunks) {
		return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
	}
	function concatChunks(chunks, size) {
		if (chunks[0].length === size) return chunks.shift();
		const buffer = new Uint8Array(size);
		let j = 0;
		for (let i = 0; i < size; i++) {
			buffer[i] = chunks[0][j++];
			if (j === chunks[0].length) {
				chunks.shift();
				j = 0;
			}
		}
		if (chunks.length && j < chunks[0].length) chunks[0] = chunks[0].slice(j);
		return buffer;
	}
	function createPacketDecoderStream(maxPayload, binaryType) {
		if (!TEXT_DECODER) TEXT_DECODER = new TextDecoder();
		const chunks = [];
		let state = 0;
		let expectedLength = -1;
		let isBinary = false;
		return new TransformStream({ transform(chunk, controller) {
			chunks.push(chunk);
			while (true) {
				if (state === 0) {
					if (totalLength(chunks) < 1) break;
					const header = concatChunks(chunks, 1);
					isBinary = (header[0] & 128) === 128;
					expectedLength = header[0] & 127;
					if (expectedLength < 126) state = 3;
					else if (expectedLength === 126) state = 1;
					else state = 2;
				} else if (state === 1) {
					if (totalLength(chunks) < 2) break;
					const headerArray = concatChunks(chunks, 2);
					expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
					state = 3;
				} else if (state === 2) {
					if (totalLength(chunks) < 8) break;
					const headerArray = concatChunks(chunks, 8);
					const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
					const n = view.getUint32(0);
					if (n > Math.pow(2, 21) - 1) {
						controller.enqueue(commons_js_1.ERROR_PACKET);
						break;
					}
					expectedLength = n * Math.pow(2, 32) + view.getUint32(4);
					state = 3;
				} else {
					if (totalLength(chunks) < expectedLength) break;
					const data = concatChunks(chunks, expectedLength);
					controller.enqueue((0, decodePacket_js_1.decodePacket)(isBinary ? data : TEXT_DECODER.decode(data), binaryType));
					state = 0;
				}
				if (expectedLength === 0 || expectedLength > maxPayload) {
					controller.enqueue(commons_js_1.ERROR_PACKET);
					break;
				}
			}
		} });
	}
	exports.protocol = 4;
}));
//#endregion
//#region node_modules/engine.io/build/parser-v3/utf8.js
var require_utf8 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/*! https://mths.be/utf8js v2.1.2 by @mathias */
	var stringFromCharCode = String.fromCharCode;
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 55296 && value <= 56319 && counter < length) {
				extra = string.charCodeAt(counter++);
				if ((extra & 64512) == 56320) output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
				else {
					output.push(value);
					counter--;
				}
			} else output.push(value);
		}
		return output;
	}
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = "";
		while (++index < length) {
			value = array[index];
			if (value > 65535) {
				value -= 65536;
				output += stringFromCharCode(value >>> 10 & 1023 | 55296);
				value = 56320 | value & 1023;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}
	function checkScalarValue(codePoint, strict) {
		if (codePoint >= 55296 && codePoint <= 57343) {
			if (strict) throw Error("Lone surrogate U+" + codePoint.toString(16).toUpperCase() + " is not a scalar value");
			return false;
		}
		return true;
	}
	function createByte(codePoint, shift) {
		return stringFromCharCode(codePoint >> shift & 63 | 128);
	}
	function encodeCodePoint(codePoint, strict) {
		if ((codePoint & 4294967168) == 0) return stringFromCharCode(codePoint);
		var symbol = "";
		if ((codePoint & 4294965248) == 0) symbol = stringFromCharCode(codePoint >> 6 & 31 | 192);
		else if ((codePoint & 4294901760) == 0) {
			if (!checkScalarValue(codePoint, strict)) codePoint = 65533;
			symbol = stringFromCharCode(codePoint >> 12 & 15 | 224);
			symbol += createByte(codePoint, 6);
		} else if ((codePoint & 4292870144) == 0) {
			symbol = stringFromCharCode(codePoint >> 18 & 7 | 240);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode(codePoint & 63 | 128);
		return symbol;
	}
	function utf8encode(string, opts) {
		opts = opts || {};
		var strict = false !== opts.strict;
		var codePoints = ucs2decode(string);
		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = "";
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint, strict);
		}
		return byteString;
	}
	function readContinuationByte() {
		if (byteIndex >= byteCount) throw Error("Invalid byte index");
		var continuationByte = byteArray[byteIndex] & 255;
		byteIndex++;
		if ((continuationByte & 192) == 128) return continuationByte & 63;
		throw Error("Invalid continuation byte");
	}
	function decodeSymbol(strict) {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;
		if (byteIndex > byteCount) throw Error("Invalid byte index");
		if (byteIndex == byteCount) return false;
		byte1 = byteArray[byteIndex] & 255;
		byteIndex++;
		if ((byte1 & 128) == 0) return byte1;
		if ((byte1 & 224) == 192) {
			byte2 = readContinuationByte();
			codePoint = (byte1 & 31) << 6 | byte2;
			if (codePoint >= 128) return codePoint;
			else throw Error("Invalid continuation byte");
		}
		if ((byte1 & 240) == 224) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = (byte1 & 15) << 12 | byte2 << 6 | byte3;
			if (codePoint >= 2048) return checkScalarValue(codePoint, strict) ? codePoint : 65533;
			else throw Error("Invalid continuation byte");
		}
		if ((byte1 & 248) == 240) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
			if (codePoint >= 65536 && codePoint <= 1114111) return codePoint;
		}
		throw Error("Invalid UTF-8 detected");
	}
	var byteArray;
	var byteCount;
	var byteIndex;
	function utf8decode(byteString, opts) {
		opts = opts || {};
		var strict = false !== opts.strict;
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol(strict)) !== false) codePoints.push(tmp);
		return ucs2encode(codePoints);
	}
	module.exports = {
		version: "2.1.2",
		encode: utf8encode,
		decode: utf8decode
	};
}));
//#endregion
//#region node_modules/engine.io/build/parser-v3/index.js
var require_parser_v3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.packets = exports.protocol = void 0;
	exports.encodePacket = encodePacket;
	exports.encodeBase64Packet = encodeBase64Packet;
	exports.decodePacket = decodePacket;
	exports.decodeBase64Packet = decodeBase64Packet;
	exports.encodePayload = encodePayload;
	exports.decodePayload = decodePayload;
	exports.encodePayloadAsBinary = encodePayloadAsBinary;
	exports.decodePayloadAsBinary = decodePayloadAsBinary;
	/**
	* Module dependencies.
	*/
	var utf8 = require_utf8();
	/**
	* Current protocol version.
	*/
	exports.protocol = 3;
	var hasBinary = (packets) => {
		for (const packet of packets) if (packet.data instanceof ArrayBuffer || ArrayBuffer.isView(packet.data)) return true;
		return false;
	};
	/**
	* Packet types.
	*/
	exports.packets = {
		open: 0,
		close: 1,
		ping: 2,
		pong: 3,
		message: 4,
		upgrade: 5,
		noop: 6
	};
	var packetslist = Object.keys(exports.packets);
	/**
	* Premade error packet.
	*/
	var err = {
		type: "error",
		data: "parser error"
	};
	var EMPTY_BUFFER = Buffer.concat([]);
	/**
	* Encodes a packet.
	*
	*     <packet type id> [ <data> ]
	*
	* Example:
	*
	*     5hello world
	*     3
	*     4
	*
	* Binary is encoded in an identical principle
	*
	* @api private
	*/
	function encodePacket(packet, supportsBinary, utf8encode, callback) {
		if (typeof supportsBinary === "function") {
			callback = supportsBinary;
			supportsBinary = null;
		}
		if (typeof utf8encode === "function") {
			callback = utf8encode;
			utf8encode = null;
		}
		if (Buffer.isBuffer(packet.data)) return encodeBuffer(packet, supportsBinary, callback);
		else if (packet.data && (packet.data.buffer || packet.data) instanceof ArrayBuffer) return encodeBuffer({
			type: packet.type,
			data: arrayBufferToBuffer(packet.data)
		}, supportsBinary, callback);
		var encoded = exports.packets[packet.type];
		if (void 0 !== packet.data) encoded += utf8encode ? utf8.encode(String(packet.data), { strict: false }) : String(packet.data);
		return callback("" + encoded);
	}
	/**
	* Encode Buffer data
	*/
	function encodeBuffer(packet, supportsBinary, callback) {
		if (!supportsBinary) return encodeBase64Packet(packet, callback);
		var data = packet.data;
		var typeBuffer = Buffer.allocUnsafe(1);
		typeBuffer[0] = exports.packets[packet.type];
		return callback(Buffer.concat([typeBuffer, data]));
	}
	/**
	* Encodes a packet with binary data in a base64 string
	*
	* @param {Object} packet, has `type` and `data`
	* @return {String} base64 encoded message
	*/
	function encodeBase64Packet(packet, callback) {
		var data = Buffer.isBuffer(packet.data) ? packet.data : arrayBufferToBuffer(packet.data);
		var message = "b" + exports.packets[packet.type];
		message += data.toString("base64");
		return callback(message);
	}
	/**
	* Decodes a packet. Data also available as an ArrayBuffer if requested.
	*
	* @return {import('engine.io-parser').Packet} with `type` and `data` (if any)
	* @api private
	*/
	function decodePacket(data, binaryType, utf8decode) {
		if (data === void 0) return err;
		let type;
		if (typeof data === "string") {
			type = data.charAt(0);
			if (type === "b") return decodeBase64Packet(data.slice(1), binaryType);
			if (utf8decode) {
				data = tryDecode(data);
				if (data === false) return err;
			}
			if (Number(type) != type || !packetslist[type]) return err;
			if (data.length > 1) return {
				type: packetslist[type],
				data: data.slice(1)
			};
			else return { type: packetslist[type] };
		}
		if (binaryType === "arraybuffer") {
			var intArray = new Uint8Array(data);
			type = intArray[0];
			return {
				type: packetslist[type],
				data: intArray.buffer.slice(1)
			};
		}
		if (data instanceof ArrayBuffer) data = arrayBufferToBuffer(data);
		type = data[0];
		return {
			type: packetslist[type],
			data: data.slice(1)
		};
	}
	function tryDecode(data) {
		try {
			data = utf8.decode(data, { strict: false });
		} catch (e) {
			return false;
		}
		return data;
	}
	/**
	* Decodes a packet encoded in a base64 string.
	*
	* @param {String} base64 encoded message
	* @return {Object} with `type` and `data` (if any)
	*/
	function decodeBase64Packet(msg, binaryType) {
		var type = packetslist[msg.charAt(0)];
		var data = Buffer.from(msg.slice(1), "base64");
		if (binaryType === "arraybuffer") {
			var abv = new Uint8Array(data.length);
			for (var i = 0; i < abv.length; i++) abv[i] = data[i];
			data = abv.buffer;
		}
		return {
			type,
			data
		};
	}
	/**
	* Encodes multiple messages (payload).
	*
	*     <length>:data
	*
	* Example:
	*
	*     11:hello world2:hi
	*
	* If any contents are binary, they will be encoded as base64 strings. Base64
	* encoded strings are marked with a b before the length specifier
	*
	* @param {Array} packets
	* @api private
	*/
	function encodePayload(packets, supportsBinary, callback) {
		if (typeof supportsBinary === "function") {
			callback = supportsBinary;
			supportsBinary = null;
		}
		if (supportsBinary && hasBinary(packets)) return encodePayloadAsBinary(packets, callback);
		if (!packets.length) return callback("0:");
		function encodeOne(packet, doneCallback) {
			encodePacket(packet, supportsBinary, false, function(message) {
				doneCallback(null, setLengthHeader(message));
			});
		}
		map(packets, encodeOne, function(err, results) {
			return callback(results.join(""));
		});
	}
	function setLengthHeader(message) {
		return message.length + ":" + message;
	}
	/**
	* Async array map using after
	*/
	function map(ary, each, done) {
		const results = new Array(ary.length);
		let count = 0;
		for (let i = 0; i < ary.length; i++) each(ary[i], (error, msg) => {
			results[i] = msg;
			if (++count === ary.length) done(null, results);
		});
	}
	function decodePayload(data, binaryType, callback) {
		if (typeof data !== "string") return decodePayloadAsBinary(data, binaryType, callback);
		if (typeof binaryType === "function") {
			callback = binaryType;
			binaryType = null;
		}
		if (data === "") return callback(err, 0, 1);
		var length = "", n, msg, packet;
		for (var i = 0, l = data.length; i < l; i++) {
			var chr = data.charAt(i);
			if (chr !== ":") {
				length += chr;
				continue;
			}
			if (length === "" || length != (n = Number(length))) return callback(err, 0, 1);
			msg = data.slice(i + 1, i + 1 + n);
			if (length != msg.length) return callback(err, 0, 1);
			if (msg.length) {
				packet = decodePacket(msg, binaryType, false);
				if (err.type === packet.type && err.data === packet.data) return callback(err, 0, 1);
				if (false === callback(packet, i + n, l)) return;
			}
			i += n;
			length = "";
		}
		if (length !== "") return callback(err, 0, 1);
	}
	/**
	*
	* Converts a buffer to a utf8.js encoded string
	*
	* @api private
	*/
	function bufferToString(buffer) {
		var str = "";
		for (var i = 0, l = buffer.length; i < l; i++) str += String.fromCharCode(buffer[i]);
		return str;
	}
	/**
	*
	* Converts a utf8.js encoded string to a buffer
	*
	* @api private
	*/
	function stringToBuffer(string) {
		var buf = Buffer.allocUnsafe(string.length);
		for (var i = 0, l = string.length; i < l; i++) buf.writeUInt8(string.charCodeAt(i), i);
		return buf;
	}
	/**
	*
	* Converts an ArrayBuffer to a Buffer
	*
	* @api private
	*/
	function arrayBufferToBuffer(data) {
		var length = data.byteLength || data.length;
		var offset = data.byteOffset || 0;
		return Buffer.from(data.buffer || data, offset, length);
	}
	/**
	* Encodes multiple messages (payload) as binary.
	*
	* <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
	* 255><data>
	*
	* Example:
	* 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
	*
	* @param {Array} packets
	* @return {Buffer} encoded payload
	* @api private
	*/
	function encodePayloadAsBinary(packets, callback) {
		if (!packets.length) return callback(EMPTY_BUFFER);
		map(packets, encodeOneBinaryPacket, function(err, results) {
			return callback(Buffer.concat(results));
		});
	}
	function encodeOneBinaryPacket(p, doneCallback) {
		function onBinaryPacketEncode(packet) {
			var encodingLength = "" + packet.length;
			var sizeBuffer;
			if (typeof packet === "string") {
				sizeBuffer = Buffer.allocUnsafe(encodingLength.length + 2);
				sizeBuffer[0] = 0;
				for (var i = 0; i < encodingLength.length; i++) sizeBuffer[i + 1] = parseInt(encodingLength[i], 10);
				sizeBuffer[sizeBuffer.length - 1] = 255;
				return doneCallback(null, Buffer.concat([sizeBuffer, stringToBuffer(packet)]));
			}
			sizeBuffer = Buffer.allocUnsafe(encodingLength.length + 2);
			sizeBuffer[0] = 1;
			for (var i = 0; i < encodingLength.length; i++) sizeBuffer[i + 1] = parseInt(encodingLength[i], 10);
			sizeBuffer[sizeBuffer.length - 1] = 255;
			doneCallback(null, Buffer.concat([sizeBuffer, packet]));
		}
		encodePacket(p, true, true, onBinaryPacketEncode);
	}
	function decodePayloadAsBinary(data, binaryType, callback) {
		if (typeof binaryType === "function") {
			callback = binaryType;
			binaryType = null;
		}
		var bufferTail = data;
		var buffers = [];
		var i;
		while (bufferTail.length > 0) {
			var strLen = "";
			var isString = bufferTail[0] === 0;
			for (i = 1;; i++) {
				if (bufferTail[i] === 255) break;
				if (strLen.length > 310) return callback(err, 0, 1);
				strLen += "" + bufferTail[i];
			}
			bufferTail = bufferTail.slice(strLen.length + 1);
			var msgLength = parseInt(strLen, 10);
			var msg = bufferTail.slice(1, msgLength + 1);
			if (isString) msg = bufferToString(msg);
			buffers.push(msg);
			bufferTail = bufferTail.slice(msgLength + 1);
		}
		var total = buffers.length;
		for (i = 0; i < total; i++) {
			var buffer = buffers[i];
			callback(decodePacket(buffer, binaryType, true), i, total);
		}
	}
}));
//#endregion
//#region node_modules/ms/index.js
var require_ms = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Helpers.
	*/
	var s = 1e3;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;
	/**
	* Parse or format the given `val`.
	*
	* Options:
	*
	*  - `long` verbose formatting [false]
	*
	* @param {String|Number} val
	* @param {Object} [options]
	* @throws {Error} throw an error if val is not a non-empty string or a number
	* @return {String|Number}
	* @api public
	*/
	module.exports = function(val, options) {
		options = options || {};
		var type = typeof val;
		if (type === "string" && val.length > 0) return parse(val);
		else if (type === "number" && isFinite(val)) return options.long ? fmtLong(val) : fmtShort(val);
		throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
	};
	/**
	* Parse the given `str` and return milliseconds.
	*
	* @param {String} str
	* @return {Number}
	* @api private
	*/
	function parse(str) {
		str = String(str);
		if (str.length > 100) return;
		var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
		if (!match) return;
		var n = parseFloat(match[1]);
		switch ((match[2] || "ms").toLowerCase()) {
			case "years":
			case "year":
			case "yrs":
			case "yr":
			case "y": return n * y;
			case "weeks":
			case "week":
			case "w": return n * w;
			case "days":
			case "day":
			case "d": return n * d;
			case "hours":
			case "hour":
			case "hrs":
			case "hr":
			case "h": return n * h;
			case "minutes":
			case "minute":
			case "mins":
			case "min":
			case "m": return n * m;
			case "seconds":
			case "second":
			case "secs":
			case "sec":
			case "s": return n * s;
			case "milliseconds":
			case "millisecond":
			case "msecs":
			case "msec":
			case "ms": return n;
			default: return;
		}
	}
	/**
	* Short format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtShort(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return Math.round(ms / d) + "d";
		if (msAbs >= h) return Math.round(ms / h) + "h";
		if (msAbs >= m) return Math.round(ms / m) + "m";
		if (msAbs >= s) return Math.round(ms / s) + "s";
		return ms + "ms";
	}
	/**
	* Long format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtLong(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return plural(ms, msAbs, d, "day");
		if (msAbs >= h) return plural(ms, msAbs, h, "hour");
		if (msAbs >= m) return plural(ms, msAbs, m, "minute");
		if (msAbs >= s) return plural(ms, msAbs, s, "second");
		return ms + " ms";
	}
	/**
	* Pluralization helper.
	*/
	function plural(ms, msAbs, n, name) {
		var isPlural = msAbs >= n * 1.5;
		return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
	}
}));
//#endregion
//#region node_modules/debug/src/common.js
var require_common = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This is the common logic for both the Node.js and web browser
	* implementations of `debug()`.
	*/
	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = require_ms();
		createDebug.destroy = destroy;
		Object.keys(env).forEach((key) => {
			createDebug[key] = env[key];
		});
		/**
		* The currently active debug mode names, and names to skip.
		*/
		createDebug.names = [];
		createDebug.skips = [];
		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};
		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;
			for (let i = 0; i < namespace.length; i++) {
				hash = (hash << 5) - hash + namespace.charCodeAt(i);
				hash |= 0;
			}
			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;
		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;
			function debug(...args) {
				if (!debug.enabled) return;
				const self = debug;
				const curr = Number(/* @__PURE__ */ new Date());
				self.diff = curr - (prevTime || curr);
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;
				args[0] = createDebug.coerce(args[0]);
				if (typeof args[0] !== "string") args.unshift("%O");
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					if (match === "%%") return "%";
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === "function") {
						const val = args[index];
						match = formatter.call(self, val);
						args.splice(index, 1);
						index--;
					}
					return match;
				});
				createDebug.formatArgs.call(self, args);
				(self.log || createDebug.log).apply(self, args);
			}
			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy;
			Object.defineProperty(debug, "enabled", {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) return enableOverride;
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}
					return enabledCache;
				},
				set: (v) => {
					enableOverride = v;
				}
			});
			if (typeof createDebug.init === "function") createDebug.init(debug);
			return debug;
		}
		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}
		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;
			createDebug.names = [];
			createDebug.skips = [];
			const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
			for (const ns of split) if (ns[0] === "-") createDebug.skips.push(ns.slice(1));
			else createDebug.names.push(ns);
		}
		/**
		* Checks if the given string matches a namespace template, honoring
		* asterisks as wildcards.
		*
		* @param {String} search
		* @param {String} template
		* @return {Boolean}
		*/
		function matchesTemplate(search, template) {
			let searchIndex = 0;
			let templateIndex = 0;
			let starIndex = -1;
			let matchIndex = 0;
			while (searchIndex < search.length) if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
				if (template[templateIndex] === "*") {
					starIndex = templateIndex;
					matchIndex = searchIndex;
					templateIndex++;
				} else {
					searchIndex++;
					templateIndex++;
				}
			} else if (starIndex !== -1) {
				templateIndex = starIndex + 1;
				matchIndex++;
				searchIndex = matchIndex;
			} else return false;
			while (templateIndex < template.length && template[templateIndex] === "*") templateIndex++;
			return templateIndex === template.length;
		}
		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [...createDebug.names, ...createDebug.skips.map((namespace) => "-" + namespace)].join(",");
			createDebug.enable("");
			return namespaces;
		}
		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			for (const skip of createDebug.skips) if (matchesTemplate(name, skip)) return false;
			for (const ns of createDebug.names) if (matchesTemplate(name, ns)) return true;
			return false;
		}
		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) return val.stack || val.message;
			return val;
		}
		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
		}
		createDebug.enable(createDebug.load());
		return createDebug;
	}
	module.exports = setup;
}));
//#endregion
//#region node_modules/debug/src/browser.js
var require_browser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This is the web browser implementation of `debug()`.
	*/
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();
	exports.destroy = (() => {
		let warned = false;
		return () => {
			if (!warned) {
				warned = true;
				console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
			}
		};
	})();
	/**
	* Colors.
	*/
	exports.colors = [
		"#0000CC",
		"#0000FF",
		"#0033CC",
		"#0033FF",
		"#0066CC",
		"#0066FF",
		"#0099CC",
		"#0099FF",
		"#00CC00",
		"#00CC33",
		"#00CC66",
		"#00CC99",
		"#00CCCC",
		"#00CCFF",
		"#3300CC",
		"#3300FF",
		"#3333CC",
		"#3333FF",
		"#3366CC",
		"#3366FF",
		"#3399CC",
		"#3399FF",
		"#33CC00",
		"#33CC33",
		"#33CC66",
		"#33CC99",
		"#33CCCC",
		"#33CCFF",
		"#6600CC",
		"#6600FF",
		"#6633CC",
		"#6633FF",
		"#66CC00",
		"#66CC33",
		"#9900CC",
		"#9900FF",
		"#9933CC",
		"#9933FF",
		"#99CC00",
		"#99CC33",
		"#CC0000",
		"#CC0033",
		"#CC0066",
		"#CC0099",
		"#CC00CC",
		"#CC00FF",
		"#CC3300",
		"#CC3333",
		"#CC3366",
		"#CC3399",
		"#CC33CC",
		"#CC33FF",
		"#CC6600",
		"#CC6633",
		"#CC9900",
		"#CC9933",
		"#CCCC00",
		"#CCCC33",
		"#FF0000",
		"#FF0033",
		"#FF0066",
		"#FF0099",
		"#FF00CC",
		"#FF00FF",
		"#FF3300",
		"#FF3333",
		"#FF3366",
		"#FF3399",
		"#FF33CC",
		"#FF33FF",
		"#FF6600",
		"#FF6633",
		"#FF9900",
		"#FF9933",
		"#FFCC00",
		"#FFCC33"
	];
	/**
	* Currently only WebKit-based Web Inspectors, Firefox >= v31,
	* and the Firebug extension (any Firefox version) are known
	* to support "%c" CSS customizations.
	*
	* TODO: add a `localStorage` variable to explicitly enable/disable colors
	*/
	function useColors() {
		if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) return true;
		if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) return false;
		let m;
		return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
	}
	/**
	* Colorize log arguments if enabled.
	*
	* @api public
	*/
	function formatArgs(args) {
		args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
		if (!this.useColors) return;
		const c = "color: " + this.color;
		args.splice(1, 0, c, "color: inherit");
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, (match) => {
			if (match === "%%") return;
			index++;
			if (match === "%c") lastC = index;
		});
		args.splice(lastC, 0, c);
	}
	/**
	* Invokes `console.debug()` when available.
	* No-op when `console.debug` is not a "function".
	* If `console.debug` is not available, falls back
	* to `console.log`.
	*
	* @api public
	*/
	exports.log = console.debug || console.log || (() => {});
	/**
	* Save `namespaces`.
	*
	* @param {String} namespaces
	* @api private
	*/
	function save(namespaces) {
		try {
			if (namespaces) exports.storage.setItem("debug", namespaces);
			else exports.storage.removeItem("debug");
		} catch (error) {}
	}
	/**
	* Load `namespaces`.
	*
	* @return {String} returns the previously persisted debug modes
	* @api private
	*/
	function load() {
		let r;
		try {
			r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
		} catch (error) {}
		if (!r && typeof process !== "undefined" && "env" in process) r = process.env.DEBUG;
		return r;
	}
	/**
	* Localstorage attempts to return the localstorage.
	*
	* This is necessary because safari throws
	* when a user disables cookies/localstorage
	* and you attempt to access it.
	*
	* @return {LocalStorage}
	* @api private
	*/
	function localstorage() {
		try {
			return localStorage;
		} catch (error) {}
	}
	module.exports = require_common()(exports);
	var { formatters } = module.exports;
	/**
	* Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	*/
	formatters.j = function(v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return "[UnexpectedJSONParseError]: " + error.message;
		}
	};
}));
//#endregion
//#region node_modules/debug/src/node.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Module dependencies.
	*/
	var tty = require("tty");
	var util = require("util");
	/**
	* This is the Node.js implementation of `debug()`.
	*/
	exports.init = init;
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.destroy = util.deprecate(() => {}, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
	/**
	* Colors.
	*/
	exports.colors = [
		6,
		2,
		3,
		4,
		5,
		1
	];
	try {
		const supportsColor = require("supports-color");
		if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	} catch (error) {}
	/**
	* Build up the default `inspectOpts` object from the environment variables.
	*
	*   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
	*/
	exports.inspectOpts = Object.keys(process.env).filter((key) => {
		return /^debug_/i.test(key);
	}).reduce((obj, key) => {
		const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});
		let val = process.env[key];
		if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
		else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
		else if (val === "null") val = null;
		else val = Number(val);
		obj[prop] = val;
		return obj;
	}, {});
	/**
	* Is stdout a TTY? Colored output is enabled when `true`.
	*/
	function useColors() {
		return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
	}
	/**
	* Adds ANSI color escape codes if enabled.
	*
	* @api public
	*/
	function formatArgs(args) {
		const { namespace: name, useColors } = this;
		if (useColors) {
			const c = this.color;
			const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
			const prefix = `  ${colorCode};1m${name} \u001B[0m`;
			args[0] = prefix + args[0].split("\n").join("\n" + prefix);
			args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
		} else args[0] = getDate() + name + " " + args[0];
	}
	function getDate() {
		if (exports.inspectOpts.hideDate) return "";
		return (/* @__PURE__ */ new Date()).toISOString() + " ";
	}
	/**
	* Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
	*/
	function log(...args) {
		return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + "\n");
	}
	/**
	* Save `namespaces`.
	*
	* @param {String} namespaces
	* @api private
	*/
	function save(namespaces) {
		if (namespaces) process.env.DEBUG = namespaces;
		else delete process.env.DEBUG;
	}
	/**
	* Load `namespaces`.
	*
	* @return {String} returns the previously persisted debug modes
	* @api private
	*/
	function load() {
		return process.env.DEBUG;
	}
	/**
	* Init logic for `debug` instances.
	*
	* Create a new `inspectOpts` object in case `useColors` is set
	* differently for a particular `debug` instance.
	*/
	function init(debug) {
		debug.inspectOpts = {};
		const keys = Object.keys(exports.inspectOpts);
		for (let i = 0; i < keys.length; i++) debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
	module.exports = require_common()(exports);
	var { formatters } = module.exports;
	/**
	* Map %o to `util.inspect()`, all on a single line.
	*/
	formatters.o = function(v) {
		this.inspectOpts.colors = this.useColors;
		return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
	};
	/**
	* Map %O to `util.inspect()`, allowing multiple lines if needed.
	*/
	formatters.O = function(v) {
		this.inspectOpts.colors = this.useColors;
		return util.inspect(v, this.inspectOpts);
	};
}));
//#endregion
//#region node_modules/debug/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Detect Electron renderer / nwjs process, which is node, but we should
	* treat as a browser.
	*/
	if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) module.exports = require_browser();
	else module.exports = require_node();
}));
//#endregion
//#region node_modules/engine.io/build/transport.js
var require_transport = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Transport = void 0;
	var events_1$5 = require("events");
	var parser_v4 = require_cjs$1();
	var parser_v3 = require_parser_v3();
	var debug = (0, require_src().default)("engine:transport");
	function noop() {}
	var Transport = class extends events_1$5.EventEmitter {
		get readyState() {
			return this._readyState;
		}
		set readyState(state) {
			debug("readyState updated from %s to %s (%s)", this._readyState, state, this.name);
			this._readyState = state;
		}
		/**
		* Transport constructor.
		*
		* @param {EngineRequest} req
		*/
		constructor(req) {
			super();
			/**
			* Whether the transport is currently ready to send packets.
			*/
			this.writable = false;
			/**
			* The current state of the transport.
			* @protected
			*/
			this._readyState = "open";
			/**
			* Whether the transport is discarded and can be safely closed (used during upgrade).
			* @protected
			*/
			this.discarded = false;
			this.protocol = req._query.EIO === "4" ? 4 : 3;
			this.parser = this.protocol === 4 ? parser_v4 : parser_v3;
			this.supportsBinary = !(req._query && req._query.b64);
		}
		/**
		* Flags the transport as discarded.
		*
		* @package
		*/
		discard() {
			this.discarded = true;
		}
		/**
		* Called with an incoming HTTP request.
		*
		* @param req
		* @package
		*/
		onRequest(req) {}
		/**
		* Closes the transport.
		*
		* @package
		*/
		close(fn) {
			if ("closed" === this.readyState || "closing" === this.readyState) return;
			this.readyState = "closing";
			this.doClose(fn || noop);
		}
		/**
		* Called with a transport error.
		*
		* @param {String} msg - message error
		* @param {Object} desc - error description
		* @protected
		*/
		onError(msg, desc) {
			if (this.listeners("error").length) {
				const err = new Error(msg);
				err.type = "TransportError";
				err.description = desc;
				this.emit("error", err);
			} else debug("ignored transport error %s (%s)", msg, desc);
		}
		/**
		* Called with parsed out a packets from the data stream.
		*
		* @param {Object} packet
		* @protected
		*/
		onPacket(packet) {
			this.emit("packet", packet);
		}
		/**
		* Called with the encoded packet data.
		*
		* @param data
		* @protected
		*/
		onData(data) {
			this.onPacket(this.parser.decodePacket(data));
		}
		/**
		* Called upon transport close.
		*
		* @protected
		*/
		onClose() {
			this.readyState = "closed";
			this.emit("close");
		}
	};
	exports.Transport = Transport;
	/**
	* The list of transports this transport can be upgraded to.
	*/
	Transport.upgradesTo = [];
}));
//#endregion
//#region node_modules/engine.io/build/transports/polling.js
var require_polling$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Polling = void 0;
	var transport_1 = require_transport();
	var zlib_1$2 = require("zlib");
	var accepts = require_accepts();
	var debug = (0, require_src().default)("engine:polling");
	var compressionMethods = {
		gzip: zlib_1$2.createGzip,
		deflate: zlib_1$2.createDeflate
	};
	var Polling = class extends transport_1.Transport {
		/**
		* HTTP polling constructor.
		*/
		constructor(req) {
			super(req);
			this.closeTimeout = 3e4;
		}
		/**
		* Transport name
		*/
		get name() {
			return "polling";
		}
		/**
		* Overrides onRequest.
		*
		* @param {EngineRequest} req
		* @package
		*/
		onRequest(req) {
			const res = req.res;
			req.res = null;
			if ("GET" === req.method) this.onPollRequest(req, res);
			else if ("POST" === req.method) this.onDataRequest(req, res);
			else {
				res.writeHead(500);
				res.end();
			}
		}
		/**
		* The client sends a request awaiting for us to send data.
		*
		* @private
		*/
		onPollRequest(req, res) {
			if (this.req) {
				debug("request overlap");
				this.onError("overlap from client");
				res.writeHead(400);
				res.end();
				return;
			}
			debug("setting request");
			this.req = req;
			this.res = res;
			const onClose = () => {
				this.onError("poll connection closed prematurely");
			};
			const cleanup = () => {
				req.removeListener("close", onClose);
				this.req = this.res = null;
			};
			req.cleanup = cleanup;
			req.on("close", onClose);
			this.writable = true;
			this.emit("ready");
			if (this.writable && this.shouldClose) {
				debug("triggering empty send to append close packet");
				this.send([{ type: "noop" }]);
			}
		}
		/**
		* The client sends a request with data.
		*
		* @private
		*/
		onDataRequest(req, res) {
			if (this.dataReq) {
				this.onError("data request overlap from client");
				res.writeHead(400);
				res.end();
				return;
			}
			const isBinary = "application/octet-stream" === req.headers["content-type"];
			if (isBinary && this.protocol === 4) {
				this.onError("invalid content");
				return res.writeHead(400).end();
			}
			this.dataReq = req;
			this.dataRes = res;
			let chunks = isBinary ? Buffer.concat([]) : "";
			const cleanup = () => {
				req.removeListener("data", onData);
				req.removeListener("end", onEnd);
				req.removeListener("close", onClose);
				this.dataReq = this.dataRes = chunks = null;
			};
			const onClose = () => {
				cleanup();
				this.onError("data request connection closed prematurely");
			};
			const onData = (data) => {
				let contentLength;
				if (isBinary) {
					chunks = Buffer.concat([chunks, data]);
					contentLength = chunks.length;
				} else {
					chunks += data;
					contentLength = Buffer.byteLength(chunks);
				}
				if (contentLength > this.maxHttpBufferSize) {
					res.writeHead(413).end();
					cleanup();
				}
			};
			const onEnd = () => {
				this.onData(chunks);
				res.writeHead(200, this.headers(req, {
					"Content-Type": "text/html",
					"Content-Length": "2"
				}));
				res.end("ok");
				cleanup();
			};
			req.on("close", onClose);
			if (!isBinary) req.setEncoding("utf8");
			req.on("data", onData);
			req.on("end", onEnd);
		}
		/**
		* Processes the incoming data payload.
		*
		* @param data - encoded payload
		* @protected
		*/
		onData(data) {
			debug("received \"%s\"", data);
			const callback = (packet) => {
				if ("close" === packet.type) {
					debug("got xhr close packet");
					this.onClose();
					return false;
				}
				this.onPacket(packet);
			};
			if (this.protocol === 3) this.parser.decodePayload(data, callback);
			else this.parser.decodePayload(data).forEach(callback);
		}
		/**
		* Overrides onClose.
		*
		* @private
		*/
		onClose() {
			if (this.writable) this.send([{ type: "noop" }]);
			super.onClose();
		}
		send(packets) {
			this.writable = false;
			if (this.shouldClose) {
				debug("appending close packet to payload");
				packets.push({ type: "close" });
				this.shouldClose();
				this.shouldClose = null;
			}
			const doWrite = (data) => {
				const compress = packets.some((packet) => {
					return packet.options && packet.options.compress;
				});
				this.write(data, { compress });
			};
			if (this.protocol === 3) this.parser.encodePayload(packets, this.supportsBinary, doWrite);
			else this.parser.encodePayload(packets, doWrite);
		}
		/**
		* Writes data as response to poll request.
		*
		* @param {String} data
		* @param {Object} options
		* @private
		*/
		write(data, options) {
			debug("writing \"%s\"", data);
			this.doWrite(data, options, () => {
				this.req.cleanup();
				this.emit("drain");
			});
		}
		/**
		* Performs the write.
		*
		* @protected
		*/
		doWrite(data, options, callback) {
			const isString = typeof data === "string";
			const headers = { "Content-Type": isString ? "text/plain; charset=UTF-8" : "application/octet-stream" };
			const respond = (data) => {
				headers["Content-Length"] = "string" === typeof data ? Buffer.byteLength(data) : data.length;
				this.res.writeHead(200, this.headers(this.req, headers));
				this.res.end(data);
				callback();
			};
			if (!this.httpCompression || !options.compress) {
				respond(data);
				return;
			}
			if ((isString ? Buffer.byteLength(data) : data.length) < this.httpCompression.threshold) {
				respond(data);
				return;
			}
			const encoding = accepts(this.req).encodings(["gzip", "deflate"]);
			if (!encoding) {
				respond(data);
				return;
			}
			this.compress(data, encoding, (err, data) => {
				if (err) {
					this.res.writeHead(500);
					this.res.end();
					callback(err);
					return;
				}
				headers["Content-Encoding"] = encoding;
				respond(data);
			});
		}
		/**
		* Compresses data.
		*
		* @private
		*/
		compress(data, encoding, callback) {
			debug("compressing");
			const buffers = [];
			let nread = 0;
			compressionMethods[encoding](this.httpCompression).on("error", callback).on("data", function(chunk) {
				buffers.push(chunk);
				nread += chunk.length;
			}).on("end", function() {
				callback(null, Buffer.concat(buffers, nread));
			}).end(data);
		}
		/**
		* Closes the transport.
		*
		* @private
		*/
		doClose(fn) {
			debug("closing");
			let closeTimeoutTimer;
			if (this.dataReq) {
				debug("aborting ongoing data request");
				this.dataReq.destroy();
			}
			const onClose = () => {
				clearTimeout(closeTimeoutTimer);
				fn();
				this.onClose();
			};
			if (this.writable) {
				debug("transport writable - closing right away");
				this.send([{ type: "close" }]);
				onClose();
			} else if (this.discarded) {
				debug("transport discarded - closing right away");
				onClose();
			} else {
				debug("transport not writable - buffering orderly close");
				this.shouldClose = onClose;
				closeTimeoutTimer = setTimeout(onClose, this.closeTimeout);
			}
		}
		/**
		* Returns headers for a response.
		*
		* @param {http.IncomingMessage} req
		* @param {Object} headers - extra headers
		* @private
		*/
		headers(req, headers = {}) {
			const ua = req.headers["user-agent"];
			if (ua && (~ua.indexOf(";MSIE") || ~ua.indexOf("Trident/"))) headers["X-XSS-Protection"] = "0";
			headers["cache-control"] = "no-store";
			this.emit("headers", headers, req);
			return headers;
		}
	};
	exports.Polling = Polling;
}));
//#endregion
//#region node_modules/engine.io/build/transports/polling-jsonp.js
var require_polling_jsonp = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.JSONP = void 0;
	var polling_1 = require_polling$1();
	var qs = require("querystring");
	var rDoubleSlashes = /\\\\n/g;
	var rSlashes = /(\\)?\\n/g;
	var JSONP = class extends polling_1.Polling {
		/**
		* JSON-P polling transport.
		*/
		constructor(req) {
			super(req);
			this.head = "___eio[" + (req._query.j || "").replace(/[^0-9]/g, "") + "](";
			this.foot = ");";
		}
		onData(data) {
			data = qs.parse(data).d;
			if ("string" === typeof data) {
				data = data.replace(rSlashes, function(match, slashes) {
					return slashes ? match : "\n";
				});
				super.onData(data.replace(rDoubleSlashes, "\\n"));
			}
		}
		doWrite(data, options, callback) {
			const js = JSON.stringify(data).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
			data = this.head + js + this.foot;
			super.doWrite(data, options, callback);
		}
	};
	exports.JSONP = JSONP;
}));
//#endregion
//#region node_modules/engine.io/build/transports/websocket.js
var require_websocket$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WebSocket = void 0;
	var transport_1 = require_transport();
	var debug = (0, require_src().default)("engine:ws");
	var WebSocket = class extends transport_1.Transport {
		/**
		* WebSocket transport
		*
		* @param {EngineRequest} req
		*/
		constructor(req) {
			super(req);
			this._doSend = (data) => {
				this.socket.send(data, this._onSent);
			};
			this._doSendLast = (data) => {
				this.socket.send(data, this._onSentLast);
			};
			this._onSent = (err) => {
				if (err) this.onError("write error", err.stack);
			};
			this._onSentLast = (err) => {
				if (err) this.onError("write error", err.stack);
				else {
					this.emit("drain");
					this.writable = true;
					this.emit("ready");
				}
			};
			this.socket = req.websocket;
			this.socket.on("message", (data, isBinary) => {
				const message = isBinary ? data : data.toString();
				debug("received \"%s\"", message);
				super.onData(message);
			});
			this.socket.once("close", this.onClose.bind(this));
			this.socket.on("error", this.onError.bind(this));
			this.writable = true;
			this.perMessageDeflate = null;
		}
		/**
		* Transport name
		*/
		get name() {
			return "websocket";
		}
		/**
		* Advertise upgrade support.
		*/
		get handlesUpgrades() {
			return true;
		}
		send(packets) {
			this.writable = false;
			for (let i = 0; i < packets.length; i++) {
				const packet = packets[i];
				const isLast = i + 1 === packets.length;
				if (this._canSendPreEncodedFrame(packet)) this.socket._sender.sendFrame(packet.options.wsPreEncodedFrame, isLast ? this._onSentLast : this._onSent);
				else this.parser.encodePacket(packet, this.supportsBinary, isLast ? this._doSendLast : this._doSend);
			}
		}
		/**
		* Whether the encoding of the WebSocket frame can be skipped.
		* @param packet
		* @private
		*/
		_canSendPreEncodedFrame(packet) {
			var _a, _b, _c;
			return !this.perMessageDeflate && typeof ((_b = (_a = this.socket) === null || _a === void 0 ? void 0 : _a._sender) === null || _b === void 0 ? void 0 : _b.sendFrame) === "function" && ((_c = packet.options) === null || _c === void 0 ? void 0 : _c.wsPreEncodedFrame) !== void 0;
		}
		doClose(fn) {
			debug("closing");
			this.socket.close();
			fn && fn();
		}
	};
	exports.WebSocket = WebSocket;
}));
//#endregion
//#region node_modules/engine.io/build/transports/webtransport.js
var require_webtransport = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WebTransport = void 0;
	var transport_1 = require_transport();
	var debug_1 = require_src();
	var engine_io_parser_1 = require_cjs$1();
	var debug = (0, debug_1.default)("engine:webtransport");
	/**
	* Reference: https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API
	*/
	var WebTransport = class extends transport_1.Transport {
		constructor(session, stream, reader) {
			super({ _query: { EIO: "4" } });
			this.session = session;
			const transformStream = (0, engine_io_parser_1.createPacketEncoderStream)();
			transformStream.readable.pipeTo(stream.writable).catch(() => {
				debug("the stream was closed");
			});
			this.writer = transformStream.writable.getWriter();
			(async () => {
				try {
					while (true) {
						const { value, done } = await reader.read();
						if (done) {
							debug("session is closed");
							break;
						}
						debug("received chunk: %o", value);
						this.onPacket(value);
					}
				} catch (e) {
					debug("error while reading: %s", e.message);
				}
			})();
			session.closed.then(() => this.onClose());
			this.writable = true;
		}
		get name() {
			return "webtransport";
		}
		async send(packets) {
			this.writable = false;
			try {
				for (let i = 0; i < packets.length; i++) {
					const packet = packets[i];
					await this.writer.write(packet);
				}
			} catch (e) {
				debug("error while writing: %s", e.message);
			}
			this.emit("drain");
			this.writable = true;
			this.emit("ready");
		}
		doClose(fn) {
			debug("closing WebTransport session");
			this.session.close();
			fn && fn();
		}
	};
	exports.WebTransport = WebTransport;
}));
//#endregion
//#region node_modules/engine.io/build/transports/index.js
var require_transports = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var polling_1 = require_polling$1();
	var polling_jsonp_1 = require_polling_jsonp();
	var websocket_1 = require_websocket$2();
	var webtransport_1 = require_webtransport();
	exports.default = {
		polling,
		websocket: websocket_1.WebSocket,
		webtransport: webtransport_1.WebTransport
	};
	/**
	* Polling polymorphic constructor.
	*/
	function polling(req) {
		if ("string" === typeof req._query.j) return new polling_jsonp_1.JSONP(req);
		else return new polling_1.Polling(req);
	}
	polling.upgradesTo = ["websocket", "webtransport"];
}));
//#endregion
//#region node_modules/engine.io/build/socket.js
var require_socket$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Socket = void 0;
	var events_1$4 = require("events");
	var debug_1 = require_src();
	var timers_1 = require("timers");
	var debug = (0, debug_1.default)("engine:socket");
	var Socket = class extends events_1$4.EventEmitter {
		get readyState() {
			return this._readyState;
		}
		set readyState(state) {
			debug("readyState updated from %s to %s", this._readyState, state);
			this._readyState = state;
		}
		constructor(id, server, transport, req, protocol) {
			super();
			/**
			* The current state of the socket.
			*/
			this._readyState = "opening";
			this.upgrading = false;
			this.upgraded = false;
			this.writeBuffer = [];
			this.packetsFn = [];
			this.sentCallbackFn = [];
			this.cleanupFn = [];
			this.id = id;
			this.server = server;
			this.request = req;
			this.protocol = protocol;
			if (req) {
				if (req.websocket && req.websocket._socket) this.remoteAddress = req.websocket._socket.remoteAddress;
				else this.remoteAddress = req.connection.remoteAddress;
			}
			this.pingTimeoutTimer = null;
			this.pingIntervalTimer = null;
			this.setTransport(transport);
			this.onOpen();
		}
		/**
		* Called upon transport considered open.
		*
		* @private
		*/
		onOpen() {
			this.readyState = "open";
			this.transport.sid = this.id;
			this.sendPacket("open", JSON.stringify({
				sid: this.id,
				upgrades: this.getAvailableUpgrades(),
				pingInterval: this.server.opts.pingInterval,
				pingTimeout: this.server.opts.pingTimeout,
				maxPayload: this.server.opts.maxHttpBufferSize
			}));
			if (this.server.opts.initialPacket) this.sendPacket("message", this.server.opts.initialPacket);
			this.emit("open");
			if (this.protocol === 3) this.resetPingTimeout();
			else this.schedulePing();
		}
		/**
		* Called upon transport packet.
		*
		* @param {Object} packet
		* @private
		*/
		onPacket(packet) {
			if ("open" !== this.readyState) return debug("packet received with closed socket");
			debug(`received packet ${packet.type}`);
			this.emit("packet", packet);
			switch (packet.type) {
				case "ping":
					if (this.transport.protocol !== 3) {
						this.onError(/* @__PURE__ */ new Error("invalid heartbeat direction"));
						return;
					}
					debug("got ping");
					this.pingTimeoutTimer.refresh();
					this.sendPacket("pong");
					this.emit("heartbeat");
					break;
				case "pong":
					if (this.transport.protocol === 3) {
						this.onError(/* @__PURE__ */ new Error("invalid heartbeat direction"));
						return;
					}
					debug("got pong");
					(0, timers_1.clearTimeout)(this.pingTimeoutTimer);
					this.pingIntervalTimer.refresh();
					this.emit("heartbeat");
					break;
				case "error":
					this.onClose("parse error");
					break;
				case "message":
					this.emit("data", packet.data);
					this.emit("message", packet.data);
			}
		}
		/**
		* Called upon transport error.
		*
		* @param {Error} err - error object
		* @private
		*/
		onError(err) {
			debug("transport error");
			this.onClose("transport error", err);
		}
		/**
		* Pings client every `this.pingInterval` and expects response
		* within `this.pingTimeout` or closes connection.
		*
		* @private
		*/
		schedulePing() {
			this.pingIntervalTimer = (0, timers_1.setTimeout)(() => {
				debug("writing ping packet - expecting pong within %sms", this.server.opts.pingTimeout);
				this.sendPacket("ping");
				this.resetPingTimeout();
			}, this.server.opts.pingInterval);
		}
		/**
		* Resets ping timeout.
		*
		* @private
		*/
		resetPingTimeout() {
			(0, timers_1.clearTimeout)(this.pingTimeoutTimer);
			this.pingTimeoutTimer = (0, timers_1.setTimeout)(() => {
				if (this.readyState === "closed") return;
				this.onClose("ping timeout");
			}, this.protocol === 3 ? this.server.opts.pingInterval + this.server.opts.pingTimeout : this.server.opts.pingTimeout);
		}
		/**
		* Attaches handlers for the given transport.
		*
		* @param {Transport} transport
		* @private
		*/
		setTransport(transport) {
			const onError = this.onError.bind(this);
			const onReady = () => this.flush();
			const onPacket = this.onPacket.bind(this);
			const onDrain = this.onDrain.bind(this);
			const onClose = this.onClose.bind(this, "transport close");
			this.transport = transport;
			this.transport.once("error", onError);
			this.transport.on("ready", onReady);
			this.transport.on("packet", onPacket);
			this.transport.on("drain", onDrain);
			this.transport.once("close", onClose);
			this.cleanupFn.push(function() {
				transport.removeListener("error", onError);
				transport.removeListener("ready", onReady);
				transport.removeListener("packet", onPacket);
				transport.removeListener("drain", onDrain);
				transport.removeListener("close", onClose);
			});
		}
		/**
		* Upon transport "drain" event
		*
		* @private
		*/
		onDrain() {
			if (this.sentCallbackFn.length > 0) {
				debug("executing batch send callback");
				const seqFn = this.sentCallbackFn.shift();
				if (seqFn) for (let i = 0; i < seqFn.length; i++) seqFn[i](this.transport);
			}
		}
		/**
		* Upgrades socket to the given transport
		*
		* @param {Transport} transport
		* @private
		*/
		_maybeUpgrade(transport) {
			debug("might upgrade socket transport from \"%s\" to \"%s\"", this.transport.name, transport.name);
			this.upgrading = true;
			const upgradeTimeoutTimer = (0, timers_1.setTimeout)(() => {
				debug("client did not complete upgrade - closing transport");
				cleanup();
				if ("open" === transport.readyState) transport.close();
			}, this.server.opts.upgradeTimeout);
			let checkIntervalTimer;
			const onPacket = (packet) => {
				if ("ping" === packet.type && "probe" === packet.data) {
					debug("got probe ping packet, sending pong");
					transport.send([{
						type: "pong",
						data: "probe"
					}]);
					this.emit("upgrading", transport);
					clearInterval(checkIntervalTimer);
					checkIntervalTimer = setInterval(check, 100);
				} else if ("upgrade" === packet.type && this.readyState !== "closed") {
					debug("got upgrade packet - upgrading");
					cleanup();
					this.transport.discard();
					this.upgraded = true;
					this.clearTransport();
					this.setTransport(transport);
					this.emit("upgrade", transport);
					this.flush();
					if (this.readyState === "closing") transport.close(() => {
						this.onClose("forced close");
					});
				} else {
					cleanup();
					transport.close();
				}
			};
			const check = () => {
				if ("polling" === this.transport.name && this.transport.writable) {
					debug("writing a noop packet to polling for fast upgrade");
					this.transport.send([{ type: "noop" }]);
				}
			};
			const cleanup = () => {
				this.upgrading = false;
				clearInterval(checkIntervalTimer);
				(0, timers_1.clearTimeout)(upgradeTimeoutTimer);
				transport.removeListener("packet", onPacket);
				transport.removeListener("close", onTransportClose);
				transport.removeListener("error", onError);
				this.removeListener("close", onClose);
			};
			const onError = (err) => {
				debug("client did not complete upgrade - %s", err);
				cleanup();
				transport.close();
				transport = null;
			};
			const onTransportClose = () => {
				onError("transport closed");
			};
			const onClose = () => {
				onError("socket closed");
			};
			transport.on("packet", onPacket);
			transport.once("close", onTransportClose);
			transport.once("error", onError);
			this.once("close", onClose);
		}
		/**
		* Clears listeners and timers associated with current transport.
		*
		* @private
		*/
		clearTransport() {
			let cleanup;
			const toCleanUp = this.cleanupFn.length;
			for (let i = 0; i < toCleanUp; i++) {
				cleanup = this.cleanupFn.shift();
				cleanup();
			}
			this.transport.on("error", function() {
				debug("error triggered by discarded transport");
			});
			this.transport.close();
			(0, timers_1.clearTimeout)(this.pingTimeoutTimer);
		}
		/**
		* Called upon transport considered closed.
		* Possible reasons: `ping timeout`, `client error`, `parse error`,
		* `transport error`, `server close`, `transport close`
		*/
		onClose(reason, description) {
			if ("closed" !== this.readyState) {
				this.readyState = "closed";
				(0, timers_1.clearTimeout)(this.pingIntervalTimer);
				(0, timers_1.clearTimeout)(this.pingTimeoutTimer);
				process.nextTick(() => {
					this.writeBuffer = [];
				});
				this.packetsFn = [];
				this.sentCallbackFn = [];
				this.clearTransport();
				this.emit("close", reason, description);
			}
		}
		/**
		* Sends a message packet.
		*
		* @param {Object} data
		* @param {Object} options
		* @param {Function} callback
		* @return {Socket} for chaining
		*/
		send(data, options, callback) {
			this.sendPacket("message", data, options, callback);
			return this;
		}
		/**
		* Alias of {@link send}.
		*
		* @param data
		* @param options
		* @param callback
		*/
		write(data, options, callback) {
			this.sendPacket("message", data, options, callback);
			return this;
		}
		/**
		* Sends a packet.
		*
		* @param {String} type - packet type
		* @param {String} data
		* @param {Object} options
		* @param {Function} callback
		*
		* @private
		*/
		sendPacket(type, data, options = {}, callback) {
			if ("function" === typeof options) {
				callback = options;
				options = {};
			}
			if ("closing" !== this.readyState && "closed" !== this.readyState) {
				debug("sending packet \"%s\" (%s)", type, data);
				options.compress = options.compress !== false;
				const packet = {
					type,
					options
				};
				if (data) packet.data = data;
				this.emit("packetCreate", packet);
				this.writeBuffer.push(packet);
				if ("function" === typeof callback) this.packetsFn.push(callback);
				this.flush();
			}
		}
		/**
		* Attempts to flush the packets buffer.
		*
		* @private
		*/
		flush() {
			if ("closed" !== this.readyState && this.transport.writable && this.writeBuffer.length) {
				debug("flushing buffer to transport");
				this.emit("flush", this.writeBuffer);
				this.server.emit("flush", this, this.writeBuffer);
				const wbuf = this.writeBuffer;
				this.writeBuffer = [];
				if (this.packetsFn.length) {
					this.sentCallbackFn.push(this.packetsFn);
					this.packetsFn = [];
				} else this.sentCallbackFn.push(null);
				this.transport.send(wbuf);
				this.emit("drain");
				this.server.emit("drain", this);
			}
		}
		/**
		* Get available upgrades for this socket.
		*
		* @private
		*/
		getAvailableUpgrades() {
			const availableUpgrades = [];
			const allUpgrades = this.server.upgrades(this.transport.name);
			for (let i = 0; i < allUpgrades.length; ++i) {
				const upg = allUpgrades[i];
				if (this.server.opts.transports.indexOf(upg) !== -1) availableUpgrades.push(upg);
			}
			return availableUpgrades;
		}
		/**
		* Closes the socket and underlying transport.
		*
		* @param {Boolean} discard - optional, discard the transport
		* @return {Socket} for chaining
		*/
		close(discard) {
			if (discard && (this.readyState === "open" || this.readyState === "closing")) return this.closeTransport(discard);
			if ("open" !== this.readyState) return;
			this.readyState = "closing";
			if (this.writeBuffer.length) {
				debug("there are %d remaining packets in the buffer, waiting for the 'drain' event", this.writeBuffer.length);
				this.once("drain", () => {
					debug("all packets have been sent, closing the transport");
					this.closeTransport(discard);
				});
				return;
			}
			debug("the buffer is empty, closing the transport right away");
			this.closeTransport(discard);
		}
		/**
		* Closes the underlying transport.
		*
		* @param {Boolean} discard
		* @private
		*/
		closeTransport(discard) {
			debug("closing the transport (discard? %s)", !!discard);
			if (discard) this.transport.discard();
			this.transport.close(this.onClose.bind(this, "forced close"));
		}
	};
	exports.Socket = Socket;
}));
//#endregion
//#region node_modules/cookie/index.js
/*!
* cookie
* Copyright(c) 2012-2014 Roman Shtylman
* Copyright(c) 2015 Douglas Christopher Wilson
* MIT Licensed
*/
var require_cookie = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Module exports.
	* @public
	*/
	exports.parse = parse;
	exports.serialize = serialize;
	/**
	* Module variables.
	* @private
	*/
	var __toString = Object.prototype.toString;
	var __hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* RegExp to match cookie-name in RFC 6265 sec 4.1.1
	* This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
	* which has been replaced by the token definition in RFC 7230 appendix B.
	*
	* cookie-name       = token
	* token             = 1*tchar
	* tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
	*                     "*" / "+" / "-" / "." / "^" / "_" /
	*                     "`" / "|" / "~" / DIGIT / ALPHA
	*/
	var cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
	/**
	* RegExp to match cookie-value in RFC 6265 sec 4.1.1
	*
	* cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
	* cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
	*                     ; US-ASCII characters excluding CTLs,
	*                     ; whitespace DQUOTE, comma, semicolon,
	*                     ; and backslash
	*/
	var cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
	/**
	* RegExp to match domain-value in RFC 6265 sec 4.1.1
	*
	* domain-value      = <subdomain>
	*                     ; defined in [RFC1034], Section 3.5, as
	*                     ; enhanced by [RFC1123], Section 2.1
	* <subdomain>       = <label> | <subdomain> "." <label>
	* <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
	*                     Labels must be 63 characters or less.
	*                     'let-dig' not 'letter' in the first char, per RFC1123
	* <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
	* <let-dig-hyp>     = <let-dig> | "-"
	* <let-dig>         = <letter> | <digit>
	* <letter>          = any one of the 52 alphabetic characters A through Z in
	*                     upper case and a through z in lower case
	* <digit>           = any one of the ten digits 0 through 9
	*
	* Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
	*
	* > (Note that a leading %x2E ("."), if present, is ignored even though that
	* character is not permitted, but a trailing %x2E ("."), if present, will
	* cause the user agent to ignore the attribute.)
	*/
	var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
	/**
	* RegExp to match path-value in RFC 6265 sec 4.1.1
	*
	* path-value        = <any CHAR except CTLs or ";">
	* CHAR              = %x01-7F
	*                     ; defined in RFC 5234 appendix B.1
	*/
	var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
	/**
	* Parse a cookie header.
	*
	* Parse the given cookie header string into an object
	* The object has the various cookies as keys(names) => values
	*
	* @param {string} str
	* @param {object} [opt]
	* @return {object}
	* @public
	*/
	function parse(str, opt) {
		if (typeof str !== "string") throw new TypeError("argument str must be a string");
		var obj = {};
		var len = str.length;
		if (len < 2) return obj;
		var dec = opt && opt.decode || decode;
		var index = 0;
		var eqIdx = 0;
		var endIdx = 0;
		do {
			eqIdx = str.indexOf("=", index);
			if (eqIdx === -1) break;
			endIdx = str.indexOf(";", index);
			if (endIdx === -1) endIdx = len;
			else if (eqIdx > endIdx) {
				index = str.lastIndexOf(";", eqIdx - 1) + 1;
				continue;
			}
			var keyStartIdx = startIndex(str, index, eqIdx);
			var keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
			var key = str.slice(keyStartIdx, keyEndIdx);
			if (!__hasOwnProperty.call(obj, key)) {
				var valStartIdx = startIndex(str, eqIdx + 1, endIdx);
				var valEndIdx = endIndex(str, endIdx, valStartIdx);
				if (str.charCodeAt(valStartIdx) === 34 && str.charCodeAt(valEndIdx - 1) === 34) {
					valStartIdx++;
					valEndIdx--;
				}
				obj[key] = tryDecode(str.slice(valStartIdx, valEndIdx), dec);
			}
			index = endIdx + 1;
		} while (index < len);
		return obj;
	}
	function startIndex(str, index, max) {
		do {
			var code = str.charCodeAt(index);
			if (code !== 32 && code !== 9) return index;
		} while (++index < max);
		return max;
	}
	function endIndex(str, index, min) {
		while (index > min) {
			var code = str.charCodeAt(--index);
			if (code !== 32 && code !== 9) return index + 1;
		}
		return min;
	}
	/**
	* Serialize data into a cookie header.
	*
	* Serialize a name value pair into a cookie string suitable for
	* http headers. An optional options object specifies cookie parameters.
	*
	* serialize('foo', 'bar', { httpOnly: true })
	*   => "foo=bar; httpOnly"
	*
	* @param {string} name
	* @param {string} val
	* @param {object} [opt]
	* @return {string}
	* @public
	*/
	function serialize(name, val, opt) {
		var enc = opt && opt.encode || encodeURIComponent;
		if (typeof enc !== "function") throw new TypeError("option encode is invalid");
		if (!cookieNameRegExp.test(name)) throw new TypeError("argument name is invalid");
		var value = enc(val);
		if (!cookieValueRegExp.test(value)) throw new TypeError("argument val is invalid");
		var str = name + "=" + value;
		if (!opt) return str;
		if (null != opt.maxAge) {
			var maxAge = Math.floor(opt.maxAge);
			if (!isFinite(maxAge)) throw new TypeError("option maxAge is invalid");
			str += "; Max-Age=" + maxAge;
		}
		if (opt.domain) {
			if (!domainValueRegExp.test(opt.domain)) throw new TypeError("option domain is invalid");
			str += "; Domain=" + opt.domain;
		}
		if (opt.path) {
			if (!pathValueRegExp.test(opt.path)) throw new TypeError("option path is invalid");
			str += "; Path=" + opt.path;
		}
		if (opt.expires) {
			var expires = opt.expires;
			if (!isDate(expires) || isNaN(expires.valueOf())) throw new TypeError("option expires is invalid");
			str += "; Expires=" + expires.toUTCString();
		}
		if (opt.httpOnly) str += "; HttpOnly";
		if (opt.secure) str += "; Secure";
		if (opt.partitioned) str += "; Partitioned";
		if (opt.priority) switch (typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority) {
			case "low":
				str += "; Priority=Low";
				break;
			case "medium":
				str += "; Priority=Medium";
				break;
			case "high":
				str += "; Priority=High";
				break;
			default: throw new TypeError("option priority is invalid");
		}
		if (opt.sameSite) switch (typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite) {
			case true:
				str += "; SameSite=Strict";
				break;
			case "lax":
				str += "; SameSite=Lax";
				break;
			case "strict":
				str += "; SameSite=Strict";
				break;
			case "none":
				str += "; SameSite=None";
				break;
			default: throw new TypeError("option sameSite is invalid");
		}
		return str;
	}
	/**
	* URL-decode string value. Optimized to skip native call when no %.
	*
	* @param {string} str
	* @returns {string}
	*/
	function decode(str) {
		return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
	}
	/**
	* Determine if value is a Date.
	*
	* @param {*} val
	* @private
	*/
	function isDate(val) {
		return __toString.call(val) === "[object Date]";
	}
	/**
	* Try decoding a string using a decoding function.
	*
	* @param {string} str
	* @param {function} decode
	* @private
	*/
	function tryDecode(str, decode) {
		try {
			return decode(str);
		} catch (e) {
			return str;
		}
	}
}));
//#endregion
//#region node_modules/ws/lib/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var BINARY_TYPES = [
		"nodebuffer",
		"arraybuffer",
		"fragments"
	];
	var hasBlob = typeof Blob !== "undefined";
	if (hasBlob) BINARY_TYPES.push("blob");
	module.exports = {
		BINARY_TYPES,
		CLOSE_TIMEOUT: 3e4,
		EMPTY_BUFFER: Buffer.alloc(0),
		GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
		hasBlob,
		kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
		kListener: Symbol("kListener"),
		kStatusCode: Symbol("status-code"),
		kWebSocket: Symbol("websocket"),
		NOOP: () => {}
	};
}));
//#endregion
//#region __vite-optional-peer-dep:bufferutil:ws
var __vite_optional_peer_dep_bufferutil_ws_exports = /* @__PURE__ */ __exportAll({ default: () => __vite_optional_peer_dep_bufferutil_ws_default });
var __vite_optional_peer_dep_bufferutil_ws_default;
var init___vite_optional_peer_dep_bufferutil_ws = __esmMin((() => {
	__vite_optional_peer_dep_bufferutil_ws_default = {};
	throw new Error(`Could not resolve "bufferutil" imported by "ws".`);
}));
//#endregion
//#region node_modules/ws/lib/buffer-util.js
var require_buffer_util = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { EMPTY_BUFFER } = require_constants();
	var FastBuffer = Buffer[Symbol.species];
	/**
	* Merges an array of buffers into a new buffer.
	*
	* @param {Buffer[]} list The array of buffers to concat
	* @param {Number} totalLength The total length of buffers in the list
	* @return {Buffer} The resulting buffer
	* @public
	*/
	function concat(list, totalLength) {
		if (list.length === 0) return EMPTY_BUFFER;
		if (list.length === 1) return list[0];
		const target = Buffer.allocUnsafe(totalLength);
		let offset = 0;
		for (let i = 0; i < list.length; i++) {
			const buf = list[i];
			target.set(buf, offset);
			offset += buf.length;
		}
		if (offset < totalLength) return new FastBuffer(target.buffer, target.byteOffset, offset);
		return target;
	}
	/**
	* Masks a buffer using the given mask.
	*
	* @param {Buffer} source The buffer to mask
	* @param {Buffer} mask The mask to use
	* @param {Buffer} output The buffer where to store the result
	* @param {Number} offset The offset at which to start writing
	* @param {Number} length The number of bytes to mask.
	* @public
	*/
	function _mask(source, mask, output, offset, length) {
		for (let i = 0; i < length; i++) output[offset + i] = source[i] ^ mask[i & 3];
	}
	/**
	* Unmasks a buffer using the given mask.
	*
	* @param {Buffer} buffer The buffer to unmask
	* @param {Buffer} mask The mask to use
	* @public
	*/
	function _unmask(buffer, mask) {
		for (let i = 0; i < buffer.length; i++) buffer[i] ^= mask[i & 3];
	}
	/**
	* Converts a buffer to an `ArrayBuffer`.
	*
	* @param {Buffer} buf The buffer to convert
	* @return {ArrayBuffer} Converted buffer
	* @public
	*/
	function toArrayBuffer(buf) {
		if (buf.length === buf.buffer.byteLength) return buf.buffer;
		return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
	}
	/**
	* Converts `data` to a `Buffer`.
	*
	* @param {*} data The data to convert
	* @return {Buffer} The buffer
	* @throws {TypeError}
	* @public
	*/
	function toBuffer(data) {
		toBuffer.readOnly = true;
		if (Buffer.isBuffer(data)) return data;
		let buf;
		if (data instanceof ArrayBuffer) buf = new FastBuffer(data);
		else if (ArrayBuffer.isView(data)) buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
		else {
			buf = Buffer.from(data);
			toBuffer.readOnly = false;
		}
		return buf;
	}
	module.exports = {
		concat,
		mask: _mask,
		toArrayBuffer,
		toBuffer,
		unmask: _unmask
	};
	/* istanbul ignore else  */
	if (!process.env.WS_NO_BUFFER_UTIL) try {
		const bufferUtil = (init___vite_optional_peer_dep_bufferutil_ws(), __toCommonJS(__vite_optional_peer_dep_bufferutil_ws_exports));
		module.exports.mask = function(source, mask, output, offset, length) {
			if (length < 48) _mask(source, mask, output, offset, length);
			else bufferUtil.mask(source, mask, output, offset, length);
		};
		module.exports.unmask = function(buffer, mask) {
			if (buffer.length < 32) _unmask(buffer, mask);
			else bufferUtil.unmask(buffer, mask);
		};
	} catch (e) {}
}));
//#endregion
//#region node_modules/ws/lib/limiter.js
var require_limiter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var kDone = Symbol("kDone");
	var kRun = Symbol("kRun");
	/**
	* A very simple job queue with adjustable concurrency. Adapted from
	* https://github.com/STRML/async-limiter
	*/
	var Limiter = class {
		/**
		* Creates a new `Limiter`.
		*
		* @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
		*     to run concurrently
		*/
		constructor(concurrency) {
			this[kDone] = () => {
				this.pending--;
				this[kRun]();
			};
			this.concurrency = concurrency || Infinity;
			this.jobs = [];
			this.pending = 0;
		}
		/**
		* Adds a job to the queue.
		*
		* @param {Function} job The job to run
		* @public
		*/
		add(job) {
			this.jobs.push(job);
			this[kRun]();
		}
		/**
		* Removes a job from the queue and runs it if possible.
		*
		* @private
		*/
		[kRun]() {
			if (this.pending === this.concurrency) return;
			if (this.jobs.length) {
				const job = this.jobs.shift();
				this.pending++;
				job(this[kDone]);
			}
		}
	};
	module.exports = Limiter;
}));
//#endregion
//#region node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var zlib = require("zlib");
	var bufferUtil = require_buffer_util();
	var Limiter = require_limiter();
	var { kStatusCode } = require_constants();
	var FastBuffer = Buffer[Symbol.species];
	var TRAILER = Buffer.from([
		0,
		0,
		255,
		255
	]);
	var kPerMessageDeflate = Symbol("permessage-deflate");
	var kTotalLength = Symbol("total-length");
	var kCallback = Symbol("callback");
	var kBuffers = Symbol("buffers");
	var kError = Symbol("error");
	var zlibLimiter;
	/**
	* permessage-deflate implementation.
	*/
	var PerMessageDeflate = class {
		/**
		* Creates a PerMessageDeflate instance.
		*
		* @param {Object} [options] Configuration options
		* @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
		*     for, or request, a custom client window size
		* @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
		*     acknowledge disabling of client context takeover
		* @param {Number} [options.concurrencyLimit=10] The number of concurrent
		*     calls to zlib
		* @param {Boolean} [options.isServer=false] Create the instance in either
		*     server or client mode
		* @param {Number} [options.maxPayload=0] The maximum allowed message length
		* @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
		*     use of a custom server window size
		* @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
		*     disabling of server context takeover
		* @param {Number} [options.threshold=1024] Size (in bytes) below which
		*     messages should not be compressed if context takeover is disabled
		* @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
		*     deflate
		* @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
		*     inflate
		*/
		constructor(options) {
			this._options = options || {};
			this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
			this._maxPayload = this._options.maxPayload | 0;
			this._isServer = !!this._options.isServer;
			this._deflate = null;
			this._inflate = null;
			this.params = null;
			if (!zlibLimiter) zlibLimiter = new Limiter(this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10);
		}
		/**
		* @type {String}
		*/
		static get extensionName() {
			return "permessage-deflate";
		}
		/**
		* Create an extension negotiation offer.
		*
		* @return {Object} Extension parameters
		* @public
		*/
		offer() {
			const params = {};
			if (this._options.serverNoContextTakeover) params.server_no_context_takeover = true;
			if (this._options.clientNoContextTakeover) params.client_no_context_takeover = true;
			if (this._options.serverMaxWindowBits) params.server_max_window_bits = this._options.serverMaxWindowBits;
			if (this._options.clientMaxWindowBits) params.client_max_window_bits = this._options.clientMaxWindowBits;
			else if (this._options.clientMaxWindowBits == null) params.client_max_window_bits = true;
			return params;
		}
		/**
		* Accept an extension negotiation offer/response.
		*
		* @param {Array} configurations The extension negotiation offers/reponse
		* @return {Object} Accepted configuration
		* @public
		*/
		accept(configurations) {
			configurations = this.normalizeParams(configurations);
			this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
			return this.params;
		}
		/**
		* Releases all resources used by the extension.
		*
		* @public
		*/
		cleanup() {
			if (this._inflate) {
				this._inflate.close();
				this._inflate = null;
			}
			if (this._deflate) {
				const callback = this._deflate[kCallback];
				this._deflate.close();
				this._deflate = null;
				if (callback) callback(/* @__PURE__ */ new Error("The deflate stream was closed while data was being processed"));
			}
		}
		/**
		*  Accept an extension negotiation offer.
		*
		* @param {Array} offers The extension negotiation offers
		* @return {Object} Accepted configuration
		* @private
		*/
		acceptAsServer(offers) {
			const opts = this._options;
			const accepted = offers.find((params) => {
				if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && (typeof params.client_max_window_bits === "number" ? opts.clientMaxWindowBits > params.client_max_window_bits : !params.client_max_window_bits)) return false;
				return true;
			});
			if (!accepted) throw new Error("None of the extension offers can be accepted");
			if (opts.serverNoContextTakeover) accepted.server_no_context_takeover = true;
			if (opts.clientNoContextTakeover) accepted.client_no_context_takeover = true;
			if (typeof opts.serverMaxWindowBits === "number") accepted.server_max_window_bits = opts.serverMaxWindowBits;
			if (typeof opts.clientMaxWindowBits === "number") accepted.client_max_window_bits = opts.clientMaxWindowBits;
			else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) delete accepted.client_max_window_bits;
			return accepted;
		}
		/**
		* Accept the extension negotiation response.
		*
		* @param {Array} response The extension negotiation response
		* @return {Object} Accepted configuration
		* @private
		*/
		acceptAsClient(response) {
			const params = response[0];
			if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) throw new Error("Unexpected parameter \"client_no_context_takeover\"");
			if (!params.client_max_window_bits) {
				if (typeof this._options.clientMaxWindowBits === "number") params.client_max_window_bits = this._options.clientMaxWindowBits;
			} else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) throw new Error("Unexpected or invalid parameter \"client_max_window_bits\"");
			return params;
		}
		/**
		* Normalize parameters.
		*
		* @param {Array} configurations The extension negotiation offers/reponse
		* @return {Array} The offers/response with normalized parameters
		* @private
		*/
		normalizeParams(configurations) {
			configurations.forEach((params) => {
				Object.keys(params).forEach((key) => {
					let value = params[key];
					if (value.length > 1) throw new Error(`Parameter "${key}" must have only a single value`);
					value = value[0];
					if (key === "client_max_window_bits") {
						if (value !== true) {
							const num = +value;
							if (!Number.isInteger(num) || num < 8 || num > 15) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
							value = num;
						} else if (!this._isServer) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
					} else if (key === "server_max_window_bits") {
						const num = +value;
						if (!Number.isInteger(num) || num < 8 || num > 15) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
						value = num;
					} else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
						if (value !== true) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
					} else throw new Error(`Unknown parameter "${key}"`);
					params[key] = value;
				});
			});
			return configurations;
		}
		/**
		* Decompress data. Concurrency limited.
		*
		* @param {Buffer} data Compressed data
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @public
		*/
		decompress(data, fin, callback) {
			zlibLimiter.add((done) => {
				this._decompress(data, fin, (err, result) => {
					done();
					callback(err, result);
				});
			});
		}
		/**
		* Compress data. Concurrency limited.
		*
		* @param {(Buffer|String)} data Data to compress
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @public
		*/
		compress(data, fin, callback) {
			zlibLimiter.add((done) => {
				this._compress(data, fin, (err, result) => {
					done();
					callback(err, result);
				});
			});
		}
		/**
		* Decompress data.
		*
		* @param {Buffer} data Compressed data
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @private
		*/
		_decompress(data, fin, callback) {
			const endpoint = this._isServer ? "client" : "server";
			if (!this._inflate) {
				const key = `${endpoint}_max_window_bits`;
				const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
				this._inflate = zlib.createInflateRaw({
					...this._options.zlibInflateOptions,
					windowBits
				});
				this._inflate[kPerMessageDeflate] = this;
				this._inflate[kTotalLength] = 0;
				this._inflate[kBuffers] = [];
				this._inflate.on("error", inflateOnError);
				this._inflate.on("data", inflateOnData);
			}
			this._inflate[kCallback] = callback;
			this._inflate.write(data);
			if (fin) this._inflate.write(TRAILER);
			this._inflate.flush(() => {
				const err = this._inflate[kError];
				if (err) {
					this._inflate.close();
					this._inflate = null;
					callback(err);
					return;
				}
				const data = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
				if (this._inflate._readableState.endEmitted) {
					this._inflate.close();
					this._inflate = null;
				} else {
					this._inflate[kTotalLength] = 0;
					this._inflate[kBuffers] = [];
					if (fin && this.params[`${endpoint}_no_context_takeover`]) this._inflate.reset();
				}
				callback(null, data);
			});
		}
		/**
		* Compress data.
		*
		* @param {(Buffer|String)} data Data to compress
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @private
		*/
		_compress(data, fin, callback) {
			const endpoint = this._isServer ? "server" : "client";
			if (!this._deflate) {
				const key = `${endpoint}_max_window_bits`;
				const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
				this._deflate = zlib.createDeflateRaw({
					...this._options.zlibDeflateOptions,
					windowBits
				});
				this._deflate[kTotalLength] = 0;
				this._deflate[kBuffers] = [];
				this._deflate.on("data", deflateOnData);
			}
			this._deflate[kCallback] = callback;
			this._deflate.write(data);
			this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
				if (!this._deflate) return;
				let data = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
				if (fin) data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);
				this._deflate[kCallback] = null;
				this._deflate[kTotalLength] = 0;
				this._deflate[kBuffers] = [];
				if (fin && this.params[`${endpoint}_no_context_takeover`]) this._deflate.reset();
				callback(null, data);
			});
		}
	};
	module.exports = PerMessageDeflate;
	/**
	* The listener of the `zlib.DeflateRaw` stream `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function deflateOnData(chunk) {
		this[kBuffers].push(chunk);
		this[kTotalLength] += chunk.length;
	}
	/**
	* The listener of the `zlib.InflateRaw` stream `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function inflateOnData(chunk) {
		this[kTotalLength] += chunk.length;
		if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
			this[kBuffers].push(chunk);
			return;
		}
		this[kError] = /* @__PURE__ */ new RangeError("Max payload size exceeded");
		this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
		this[kError][kStatusCode] = 1009;
		this.removeListener("data", inflateOnData);
		this.reset();
	}
	/**
	* The listener of the `zlib.InflateRaw` stream `'error'` event.
	*
	* @param {Error} err The emitted error
	* @private
	*/
	function inflateOnError(err) {
		this[kPerMessageDeflate]._inflate = null;
		if (this[kError]) {
			this[kCallback](this[kError]);
			return;
		}
		err[kStatusCode] = 1007;
		this[kCallback](err);
	}
}));
//#endregion
//#region __vite-optional-peer-dep:utf-8-validate:ws
var __vite_optional_peer_dep_utf_8_validate_ws_exports = /* @__PURE__ */ __exportAll({ default: () => __vite_optional_peer_dep_utf_8_validate_ws_default });
var __vite_optional_peer_dep_utf_8_validate_ws_default;
var init___vite_optional_peer_dep_utf_8_validate_ws = __esmMin((() => {
	__vite_optional_peer_dep_utf_8_validate_ws_default = {};
	throw new Error(`Could not resolve "utf-8-validate" imported by "ws".`);
}));
//#endregion
//#region node_modules/ws/lib/validation.js
var require_validation = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { isUtf8 } = require("buffer");
	var { hasBlob } = require_constants();
	var tokenChars = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		1,
		1,
		0,
		1,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		1,
		0,
		1,
		0
	];
	/**
	* Checks if a status code is allowed in a close frame.
	*
	* @param {Number} code The status code
	* @return {Boolean} `true` if the status code is valid, else `false`
	* @public
	*/
	function isValidStatusCode(code) {
		return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
	}
	/**
	* Checks if a given buffer contains only correct UTF-8.
	* Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
	* Markus Kuhn.
	*
	* @param {Buffer} buf The buffer to check
	* @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
	* @public
	*/
	function _isValidUTF8(buf) {
		const len = buf.length;
		let i = 0;
		while (i < len) if ((buf[i] & 128) === 0) i++;
		else if ((buf[i] & 224) === 192) {
			if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) return false;
			i += 2;
		} else if ((buf[i] & 240) === 224) {
			if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) return false;
			i += 3;
		} else if ((buf[i] & 248) === 240) {
			if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) return false;
			i += 4;
		} else return false;
		return true;
	}
	/**
	* Determines whether a value is a `Blob`.
	*
	* @param {*} value The value to be tested
	* @return {Boolean} `true` if `value` is a `Blob`, else `false`
	* @private
	*/
	function isBlob(value) {
		return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
	}
	module.exports = {
		isBlob,
		isValidStatusCode,
		isValidUTF8: _isValidUTF8,
		tokenChars
	};
	if (isUtf8) module.exports.isValidUTF8 = function(buf) {
		return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
	};
	else if (!process.env.WS_NO_UTF_8_VALIDATE) try {
		const isValidUTF8 = (init___vite_optional_peer_dep_utf_8_validate_ws(), __toCommonJS(__vite_optional_peer_dep_utf_8_validate_ws_exports));
		module.exports.isValidUTF8 = function(buf) {
			return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
		};
	} catch (e) {}
}));
//#endregion
//#region node_modules/ws/lib/receiver.js
var require_receiver = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { Writable } = require("stream");
	var PerMessageDeflate = require_permessage_deflate();
	var { BINARY_TYPES, EMPTY_BUFFER, kStatusCode, kWebSocket } = require_constants();
	var { concat, toArrayBuffer, unmask } = require_buffer_util();
	var { isValidStatusCode, isValidUTF8 } = require_validation();
	var FastBuffer = Buffer[Symbol.species];
	var GET_INFO = 0;
	var GET_PAYLOAD_LENGTH_16 = 1;
	var GET_PAYLOAD_LENGTH_64 = 2;
	var GET_MASK = 3;
	var GET_DATA = 4;
	var INFLATING = 5;
	var DEFER_EVENT = 6;
	/**
	* HyBi Receiver implementation.
	*
	* @extends Writable
	*/
	var Receiver = class extends Writable {
		/**
		* Creates a Receiver instance.
		*
		* @param {Object} [options] Options object
		* @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
		*     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
		*     multiple times in the same tick
		* @param {String} [options.binaryType=nodebuffer] The type for binary data
		* @param {Object} [options.extensions] An object containing the negotiated
		*     extensions
		* @param {Boolean} [options.isServer=false] Specifies whether to operate in
		*     client or server mode
		* @param {Number} [options.maxBufferedChunks=0] The maximum number of
		*     buffered data chunks
		* @param {Number} [options.maxFragments=0] The maximum number of message
		*     fragments
		* @param {Number} [options.maxPayload=0] The maximum allowed message length
		* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
		*     not to skip UTF-8 validation for text and close messages
		*/
		constructor(options = {}) {
			super();
			this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
			this._binaryType = options.binaryType || BINARY_TYPES[0];
			this._extensions = options.extensions || {};
			this._isServer = !!options.isServer;
			this._maxBufferedChunks = options.maxBufferedChunks | 0;
			this._maxFragments = options.maxFragments | 0;
			this._maxPayload = options.maxPayload | 0;
			this._skipUTF8Validation = !!options.skipUTF8Validation;
			this[kWebSocket] = void 0;
			this._bufferedBytes = 0;
			this._buffers = [];
			this._compressed = false;
			this._payloadLength = 0;
			this._mask = void 0;
			this._fragmented = 0;
			this._masked = false;
			this._fin = false;
			this._opcode = 0;
			this._totalPayloadLength = 0;
			this._messageLength = 0;
			this._numFragments = 0;
			this._fragments = [];
			this._errored = false;
			this._loop = false;
			this._state = GET_INFO;
		}
		/**
		* Implements `Writable.prototype._write()`.
		*
		* @param {Buffer} chunk The chunk of data to write
		* @param {String} encoding The character encoding of `chunk`
		* @param {Function} cb Callback
		* @private
		*/
		_write(chunk, encoding, cb) {
			if (this._opcode === 8 && this._state == GET_INFO) return cb();
			if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
				cb(this.createError(RangeError, "Too many buffered chunks", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS"));
				return;
			}
			this._bufferedBytes += chunk.length;
			this._buffers.push(chunk);
			this.startLoop(cb);
		}
		/**
		* Consumes `n` bytes from the buffered data.
		*
		* @param {Number} n The number of bytes to consume
		* @return {Buffer} The consumed bytes
		* @private
		*/
		consume(n) {
			this._bufferedBytes -= n;
			if (n === this._buffers[0].length) return this._buffers.shift();
			if (n < this._buffers[0].length) {
				const buf = this._buffers[0];
				this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
				return new FastBuffer(buf.buffer, buf.byteOffset, n);
			}
			const dst = Buffer.allocUnsafe(n);
			do {
				const buf = this._buffers[0];
				const offset = dst.length - n;
				if (n >= buf.length) dst.set(this._buffers.shift(), offset);
				else {
					dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
					this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
				}
				n -= buf.length;
			} while (n > 0);
			return dst;
		}
		/**
		* Starts the parsing loop.
		*
		* @param {Function} cb Callback
		* @private
		*/
		startLoop(cb) {
			this._loop = true;
			do
				switch (this._state) {
					case GET_INFO:
						this.getInfo(cb);
						break;
					case GET_PAYLOAD_LENGTH_16:
						this.getPayloadLength16(cb);
						break;
					case GET_PAYLOAD_LENGTH_64:
						this.getPayloadLength64(cb);
						break;
					case GET_MASK:
						this.getMask();
						break;
					case GET_DATA:
						this.getData(cb);
						break;
					case INFLATING:
					case DEFER_EVENT:
						this._loop = false;
						return;
				}
			while (this._loop);
			if (!this._errored) cb();
		}
		/**
		* Reads the first two bytes of a frame.
		*
		* @param {Function} cb Callback
		* @private
		*/
		getInfo(cb) {
			if (this._bufferedBytes < 2) {
				this._loop = false;
				return;
			}
			const buf = this.consume(2);
			if ((buf[0] & 48) !== 0) {
				cb(this.createError(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3"));
				return;
			}
			const compressed = (buf[0] & 64) === 64;
			if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
				cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
				return;
			}
			this._fin = (buf[0] & 128) === 128;
			this._opcode = buf[0] & 15;
			this._payloadLength = buf[1] & 127;
			if (this._opcode === 0) {
				if (compressed) {
					cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
					return;
				}
				if (!this._fragmented) {
					cb(this.createError(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE"));
					return;
				}
				this._opcode = this._fragmented;
			} else if (this._opcode === 1 || this._opcode === 2) {
				if (this._fragmented) {
					cb(this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE"));
					return;
				}
				this._compressed = compressed;
			} else if (this._opcode > 7 && this._opcode < 11) {
				if (!this._fin) {
					cb(this.createError(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN"));
					return;
				}
				if (compressed) {
					cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
					return;
				}
				if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
					cb(this.createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"));
					return;
				}
			} else {
				cb(this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE"));
				return;
			}
			if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
			this._masked = (buf[1] & 128) === 128;
			if (this._isServer) {
				if (!this._masked) {
					cb(this.createError(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK"));
					return;
				}
			} else if (this._masked) {
				cb(this.createError(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK"));
				return;
			}
			if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
			else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
			else this.haveLength(cb);
		}
		/**
		* Gets extended payload length (7+16).
		*
		* @param {Function} cb Callback
		* @private
		*/
		getPayloadLength16(cb) {
			if (this._bufferedBytes < 2) {
				this._loop = false;
				return;
			}
			this._payloadLength = this.consume(2).readUInt16BE(0);
			this.haveLength(cb);
		}
		/**
		* Gets extended payload length (7+64).
		*
		* @param {Function} cb Callback
		* @private
		*/
		getPayloadLength64(cb) {
			if (this._bufferedBytes < 8) {
				this._loop = false;
				return;
			}
			const buf = this.consume(8);
			const num = buf.readUInt32BE(0);
			if (num > Math.pow(2, 21) - 1) {
				cb(this.createError(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"));
				return;
			}
			this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
			this.haveLength(cb);
		}
		/**
		* Payload length has been read.
		*
		* @param {Function} cb Callback
		* @private
		*/
		haveLength(cb) {
			if (this._payloadLength && this._opcode < 8) {
				this._totalPayloadLength += this._payloadLength;
				if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
					cb(this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
					return;
				}
			}
			if (this._masked) this._state = GET_MASK;
			else this._state = GET_DATA;
		}
		/**
		* Reads mask bytes.
		*
		* @private
		*/
		getMask() {
			if (this._bufferedBytes < 4) {
				this._loop = false;
				return;
			}
			this._mask = this.consume(4);
			this._state = GET_DATA;
		}
		/**
		* Reads data bytes.
		*
		* @param {Function} cb Callback
		* @private
		*/
		getData(cb) {
			let data = EMPTY_BUFFER;
			if (this._payloadLength) {
				if (this._bufferedBytes < this._payloadLength) {
					this._loop = false;
					return;
				}
				data = this.consume(this._payloadLength);
				if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) unmask(data, this._mask);
			}
			if (this._opcode > 7) {
				this.controlMessage(data, cb);
				return;
			}
			if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
				cb(this.createError(RangeError, "Too many message fragments", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS"));
				return;
			}
			if (this._compressed) {
				this._state = INFLATING;
				this.decompress(data, cb);
				return;
			}
			if (data.length) {
				this._messageLength = this._totalPayloadLength;
				this._fragments.push(data);
			}
			this.dataMessage(cb);
		}
		/**
		* Decompresses data.
		*
		* @param {Buffer} data Compressed data
		* @param {Function} cb Callback
		* @private
		*/
		decompress(data, cb) {
			this._extensions[PerMessageDeflate.extensionName].decompress(data, this._fin, (err, buf) => {
				if (err) return cb(err);
				if (buf.length) {
					this._messageLength += buf.length;
					if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
						cb(this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
						return;
					}
					this._fragments.push(buf);
				}
				this.dataMessage(cb);
				if (this._state === GET_INFO) this.startLoop(cb);
			});
		}
		/**
		* Handles a data message.
		*
		* @param {Function} cb Callback
		* @private
		*/
		dataMessage(cb) {
			if (!this._fin) {
				this._state = GET_INFO;
				return;
			}
			const messageLength = this._messageLength;
			const fragments = this._fragments;
			this._totalPayloadLength = 0;
			this._messageLength = 0;
			this._fragmented = 0;
			this._numFragments = 0;
			this._fragments = [];
			if (this._opcode === 2) {
				let data;
				if (this._binaryType === "nodebuffer") data = concat(fragments, messageLength);
				else if (this._binaryType === "arraybuffer") data = toArrayBuffer(concat(fragments, messageLength));
				else if (this._binaryType === "blob") data = new Blob(fragments);
				else data = fragments;
				if (this._allowSynchronousEvents) {
					this.emit("message", data, true);
					this._state = GET_INFO;
				} else {
					this._state = DEFER_EVENT;
					setImmediate(() => {
						this.emit("message", data, true);
						this._state = GET_INFO;
						this.startLoop(cb);
					});
				}
			} else {
				const buf = concat(fragments, messageLength);
				if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
					cb(this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8"));
					return;
				}
				if (this._state === INFLATING || this._allowSynchronousEvents) {
					this.emit("message", buf, false);
					this._state = GET_INFO;
				} else {
					this._state = DEFER_EVENT;
					setImmediate(() => {
						this.emit("message", buf, false);
						this._state = GET_INFO;
						this.startLoop(cb);
					});
				}
			}
		}
		/**
		* Handles a control message.
		*
		* @param {Buffer} data Data to handle
		* @return {(Error|RangeError|undefined)} A possible error
		* @private
		*/
		controlMessage(data, cb) {
			if (this._opcode === 8) {
				if (data.length === 0) {
					this._loop = false;
					this.emit("conclude", 1005, EMPTY_BUFFER);
					this.end();
				} else {
					const code = data.readUInt16BE(0);
					if (!isValidStatusCode(code)) {
						cb(this.createError(RangeError, `invalid status code ${code}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE"));
						return;
					}
					const buf = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);
					if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
						cb(this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8"));
						return;
					}
					this._loop = false;
					this.emit("conclude", code, buf);
					this.end();
				}
				this._state = GET_INFO;
				return;
			}
			if (this._allowSynchronousEvents) {
				this.emit(this._opcode === 9 ? "ping" : "pong", data);
				this._state = GET_INFO;
			} else {
				this._state = DEFER_EVENT;
				setImmediate(() => {
					this.emit(this._opcode === 9 ? "ping" : "pong", data);
					this._state = GET_INFO;
					this.startLoop(cb);
				});
			}
		}
		/**
		* Builds an error object.
		*
		* @param {function(new:Error|RangeError)} ErrorCtor The error constructor
		* @param {String} message The error message
		* @param {Boolean} prefix Specifies whether or not to add a default prefix to
		*     `message`
		* @param {Number} statusCode The status code
		* @param {String} errorCode The exposed error code
		* @return {(Error|RangeError)} The error
		* @private
		*/
		createError(ErrorCtor, message, prefix, statusCode, errorCode) {
			this._loop = false;
			this._errored = true;
			const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
			Error.captureStackTrace(err, this.createError);
			err.code = errorCode;
			err[kStatusCode] = statusCode;
			return err;
		}
	};
	module.exports = Receiver;
}));
//#endregion
//#region node_modules/ws/lib/sender.js
var require_sender = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { Duplex: Duplex$3 } = require("stream");
	var { randomFillSync } = require("crypto");
	var { types: { isUint8Array } } = require("util");
	var PerMessageDeflate = require_permessage_deflate();
	var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
	var { isBlob, isValidStatusCode } = require_validation();
	var { mask: applyMask, toBuffer } = require_buffer_util();
	var kByteLength = Symbol("kByteLength");
	var maskBuffer = Buffer.alloc(4);
	var RANDOM_POOL_SIZE = 8192;
	var randomPool;
	var randomPoolPointer = RANDOM_POOL_SIZE;
	var DEFAULT = 0;
	var DEFLATING = 1;
	var GET_BLOB_DATA = 2;
	module.exports = class Sender {
		/**
		* Creates a Sender instance.
		*
		* @param {Duplex} socket The connection socket
		* @param {Object} [extensions] An object containing the negotiated extensions
		* @param {Function} [generateMask] The function used to generate the masking
		*     key
		*/
		constructor(socket, extensions, generateMask) {
			this._extensions = extensions || {};
			if (generateMask) {
				this._generateMask = generateMask;
				this._maskBuffer = Buffer.alloc(4);
			}
			this._socket = socket;
			this._firstFragment = true;
			this._compress = false;
			this._bufferedBytes = 0;
			this._queue = [];
			this._state = DEFAULT;
			this.onerror = NOOP;
			this[kWebSocket] = void 0;
		}
		/**
		* Frames a piece of data according to the HyBi WebSocket protocol.
		*
		* @param {(Buffer|String)} data The data to frame
		* @param {Object} options Options object
		* @param {Boolean} [options.fin=false] Specifies whether or not to set the
		*     FIN bit
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Buffer} [options.maskBuffer] The buffer used to store the masking
		*     key
		* @param {Number} options.opcode The opcode
		* @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
		*     modified
		* @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
		*     RSV1 bit
		* @return {(Buffer|String)[]} The framed data
		* @public
		*/
		static frame(data, options) {
			let mask;
			let merge = false;
			let offset = 2;
			let skipMasking = false;
			if (options.mask) {
				mask = options.maskBuffer || maskBuffer;
				if (options.generateMask) options.generateMask(mask);
				else {
					if (randomPoolPointer === RANDOM_POOL_SIZE) {
						/* istanbul ignore else  */
						if (randomPool === void 0) randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
						randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
						randomPoolPointer = 0;
					}
					mask[0] = randomPool[randomPoolPointer++];
					mask[1] = randomPool[randomPoolPointer++];
					mask[2] = randomPool[randomPoolPointer++];
					mask[3] = randomPool[randomPoolPointer++];
				}
				skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
				offset = 6;
			}
			let dataLength;
			if (typeof data === "string") {
				if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) dataLength = options[kByteLength];
				else {
					data = Buffer.from(data);
					dataLength = data.length;
				}
			} else {
				dataLength = data.length;
				merge = options.mask && options.readOnly && !skipMasking;
			}
			let payloadLength = dataLength;
			if (dataLength >= 65536) {
				offset += 8;
				payloadLength = 127;
			} else if (dataLength > 125) {
				offset += 2;
				payloadLength = 126;
			}
			const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
			target[0] = options.fin ? options.opcode | 128 : options.opcode;
			if (options.rsv1) target[0] |= 64;
			target[1] = payloadLength;
			if (payloadLength === 126) target.writeUInt16BE(dataLength, 2);
			else if (payloadLength === 127) {
				target[2] = target[3] = 0;
				target.writeUIntBE(dataLength, 4, 6);
			}
			if (!options.mask) return [target, data];
			target[1] |= 128;
			target[offset - 4] = mask[0];
			target[offset - 3] = mask[1];
			target[offset - 2] = mask[2];
			target[offset - 1] = mask[3];
			if (skipMasking) return [target, data];
			if (merge) {
				applyMask(data, mask, target, offset, dataLength);
				return [target];
			}
			applyMask(data, mask, data, 0, dataLength);
			return [target, data];
		}
		/**
		* Sends a close message to the other peer.
		*
		* @param {Number} [code] The status code component of the body
		* @param {(String|Buffer)} [data] The message component of the body
		* @param {Boolean} [mask=false] Specifies whether or not to mask the message
		* @param {Function} [cb] Callback
		* @public
		*/
		close(code, data, mask, cb) {
			let buf;
			if (code === void 0) buf = EMPTY_BUFFER;
			else if (typeof code !== "number" || !isValidStatusCode(code)) throw new TypeError("First argument must be a valid error code number");
			else if (data === void 0 || !data.length) {
				buf = Buffer.allocUnsafe(2);
				buf.writeUInt16BE(code, 0);
			} else {
				const length = Buffer.byteLength(data);
				if (length > 123) throw new RangeError("The message must not be greater than 123 bytes");
				buf = Buffer.allocUnsafe(2 + length);
				buf.writeUInt16BE(code, 0);
				if (typeof data === "string") buf.write(data, 2);
				else if (isUint8Array(data)) buf.set(data, 2);
				else throw new TypeError("Second argument must be a string or a Uint8Array");
			}
			const options = {
				[kByteLength]: buf.length,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 8,
				readOnly: false,
				rsv1: false
			};
			if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				buf,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(buf, options), cb);
		}
		/**
		* Sends a ping message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Boolean} [mask=false] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		ping(data, mask, cb) {
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (byteLength > 125) throw new RangeError("The data size must not be greater than 125 bytes");
			const options = {
				[kByteLength]: byteLength,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 9,
				readOnly,
				rsv1: false
			};
			if (isBlob(data)) {
				if (this._state !== DEFAULT) this.enqueue([
					this.getBlobData,
					data,
					false,
					options,
					cb
				]);
				else this.getBlobData(data, false, options, cb);
			} else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(data, options), cb);
		}
		/**
		* Sends a pong message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Boolean} [mask=false] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		pong(data, mask, cb) {
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (byteLength > 125) throw new RangeError("The data size must not be greater than 125 bytes");
			const options = {
				[kByteLength]: byteLength,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 10,
				readOnly,
				rsv1: false
			};
			if (isBlob(data)) {
				if (this._state !== DEFAULT) this.enqueue([
					this.getBlobData,
					data,
					false,
					options,
					cb
				]);
				else this.getBlobData(data, false, options, cb);
			} else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(data, options), cb);
		}
		/**
		* Sends a data message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Object} options Options object
		* @param {Boolean} [options.binary=false] Specifies whether `data` is binary
		*     or text
		* @param {Boolean} [options.compress=false] Specifies whether or not to
		*     compress `data`
		* @param {Boolean} [options.fin=false] Specifies whether the fragment is the
		*     last one
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		send(data, options, cb) {
			const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
			let opcode = options.binary ? 2 : 1;
			let rsv1 = options.compress;
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (this._firstFragment) {
				this._firstFragment = false;
				if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) rsv1 = byteLength >= perMessageDeflate._threshold;
				this._compress = rsv1;
			} else {
				rsv1 = false;
				opcode = 0;
			}
			if (options.fin) this._firstFragment = true;
			const opts = {
				[kByteLength]: byteLength,
				fin: options.fin,
				generateMask: this._generateMask,
				mask: options.mask,
				maskBuffer: this._maskBuffer,
				opcode,
				readOnly,
				rsv1
			};
			if (isBlob(data)) {
				if (this._state !== DEFAULT) this.enqueue([
					this.getBlobData,
					data,
					this._compress,
					opts,
					cb
				]);
				else this.getBlobData(data, this._compress, opts, cb);
			} else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				this._compress,
				opts,
				cb
			]);
			else this.dispatch(data, this._compress, opts, cb);
		}
		/**
		* Gets the contents of a blob as binary data.
		*
		* @param {Blob} blob The blob
		* @param {Boolean} [compress=false] Specifies whether or not to compress
		*     the data
		* @param {Object} options Options object
		* @param {Boolean} [options.fin=false] Specifies whether or not to set the
		*     FIN bit
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Buffer} [options.maskBuffer] The buffer used to store the masking
		*     key
		* @param {Number} options.opcode The opcode
		* @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
		*     modified
		* @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
		*     RSV1 bit
		* @param {Function} [cb] Callback
		* @private
		*/
		getBlobData(blob, compress, options, cb) {
			this._bufferedBytes += options[kByteLength];
			this._state = GET_BLOB_DATA;
			blob.arrayBuffer().then((arrayBuffer) => {
				if (this._socket.destroyed) {
					const err = /* @__PURE__ */ new Error("The socket was closed while the blob was being read");
					process.nextTick(callCallbacks, this, err, cb);
					return;
				}
				this._bufferedBytes -= options[kByteLength];
				const data = toBuffer(arrayBuffer);
				if (!compress) {
					this._state = DEFAULT;
					this.sendFrame(Sender.frame(data, options), cb);
					this.dequeue();
				} else this.dispatch(data, compress, options, cb);
			}).catch((err) => {
				process.nextTick(onError, this, err, cb);
			});
		}
		/**
		* Dispatches a message.
		*
		* @param {(Buffer|String)} data The message to send
		* @param {Boolean} [compress=false] Specifies whether or not to compress
		*     `data`
		* @param {Object} options Options object
		* @param {Boolean} [options.fin=false] Specifies whether or not to set the
		*     FIN bit
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Buffer} [options.maskBuffer] The buffer used to store the masking
		*     key
		* @param {Number} options.opcode The opcode
		* @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
		*     modified
		* @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
		*     RSV1 bit
		* @param {Function} [cb] Callback
		* @private
		*/
		dispatch(data, compress, options, cb) {
			if (!compress) {
				this.sendFrame(Sender.frame(data, options), cb);
				return;
			}
			const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
			this._bufferedBytes += options[kByteLength];
			this._state = DEFLATING;
			perMessageDeflate.compress(data, options.fin, (_, buf) => {
				if (this._socket.destroyed) {
					const err = /* @__PURE__ */ new Error("The socket was closed while data was being compressed");
					callCallbacks(this, err, cb);
					return;
				}
				this._bufferedBytes -= options[kByteLength];
				this._state = DEFAULT;
				options.readOnly = false;
				this.sendFrame(Sender.frame(buf, options), cb);
				this.dequeue();
			});
		}
		/**
		* Executes queued send operations.
		*
		* @private
		*/
		dequeue() {
			while (this._state === DEFAULT && this._queue.length) {
				const params = this._queue.shift();
				this._bufferedBytes -= params[3][kByteLength];
				Reflect.apply(params[0], this, params.slice(1));
			}
		}
		/**
		* Enqueues a send operation.
		*
		* @param {Array} params Send operation parameters.
		* @private
		*/
		enqueue(params) {
			this._bufferedBytes += params[3][kByteLength];
			this._queue.push(params);
		}
		/**
		* Sends a frame.
		*
		* @param {(Buffer | String)[]} list The frame to send
		* @param {Function} [cb] Callback
		* @private
		*/
		sendFrame(list, cb) {
			if (list.length === 2) {
				this._socket.cork();
				this._socket.write(list[0]);
				this._socket.write(list[1], cb);
				this._socket.uncork();
			} else this._socket.write(list[0], cb);
		}
	};
	/**
	* Calls queued callbacks with an error.
	*
	* @param {Sender} sender The `Sender` instance
	* @param {Error} err The error to call the callbacks with
	* @param {Function} [cb] The first callback
	* @private
	*/
	function callCallbacks(sender, err, cb) {
		if (typeof cb === "function") cb(err);
		for (let i = 0; i < sender._queue.length; i++) {
			const params = sender._queue[i];
			const callback = params[params.length - 1];
			if (typeof callback === "function") callback(err);
		}
	}
	/**
	* Handles a `Sender` error.
	*
	* @param {Sender} sender The `Sender` instance
	* @param {Error} err The error
	* @param {Function} [cb] The first pending callback
	* @private
	*/
	function onError(sender, err, cb) {
		callCallbacks(sender, err, cb);
		sender.onerror(err);
	}
}));
//#endregion
//#region node_modules/ws/lib/event-target.js
var require_event_target = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { kForOnEventAttribute, kListener } = require_constants();
	var kCode = Symbol("kCode");
	var kData = Symbol("kData");
	var kError = Symbol("kError");
	var kMessage = Symbol("kMessage");
	var kReason = Symbol("kReason");
	var kTarget = Symbol("kTarget");
	var kType = Symbol("kType");
	var kWasClean = Symbol("kWasClean");
	/**
	* Class representing an event.
	*/
	var Event = class {
		/**
		* Create a new `Event`.
		*
		* @param {String} type The name of the event
		* @throws {TypeError} If the `type` argument is not specified
		*/
		constructor(type) {
			this[kTarget] = null;
			this[kType] = type;
		}
		/**
		* @type {*}
		*/
		get target() {
			return this[kTarget];
		}
		/**
		* @type {String}
		*/
		get type() {
			return this[kType];
		}
	};
	Object.defineProperty(Event.prototype, "target", { enumerable: true });
	Object.defineProperty(Event.prototype, "type", { enumerable: true });
	/**
	* Class representing a close event.
	*
	* @extends Event
	*/
	var CloseEvent = class extends Event {
		/**
		* Create a new `CloseEvent`.
		*
		* @param {String} type The name of the event
		* @param {Object} [options] A dictionary object that allows for setting
		*     attributes via object members of the same name
		* @param {Number} [options.code=0] The status code explaining why the
		*     connection was closed
		* @param {String} [options.reason=''] A human-readable string explaining why
		*     the connection was closed
		* @param {Boolean} [options.wasClean=false] Indicates whether or not the
		*     connection was cleanly closed
		*/
		constructor(type, options = {}) {
			super(type);
			this[kCode] = options.code === void 0 ? 0 : options.code;
			this[kReason] = options.reason === void 0 ? "" : options.reason;
			this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
		}
		/**
		* @type {Number}
		*/
		get code() {
			return this[kCode];
		}
		/**
		* @type {String}
		*/
		get reason() {
			return this[kReason];
		}
		/**
		* @type {Boolean}
		*/
		get wasClean() {
			return this[kWasClean];
		}
	};
	Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
	/**
	* Class representing an error event.
	*
	* @extends Event
	*/
	var ErrorEvent = class extends Event {
		/**
		* Create a new `ErrorEvent`.
		*
		* @param {String} type The name of the event
		* @param {Object} [options] A dictionary object that allows for setting
		*     attributes via object members of the same name
		* @param {*} [options.error=null] The error that generated this event
		* @param {String} [options.message=''] The error message
		*/
		constructor(type, options = {}) {
			super(type);
			this[kError] = options.error === void 0 ? null : options.error;
			this[kMessage] = options.message === void 0 ? "" : options.message;
		}
		/**
		* @type {*}
		*/
		get error() {
			return this[kError];
		}
		/**
		* @type {String}
		*/
		get message() {
			return this[kMessage];
		}
	};
	Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
	Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
	/**
	* Class representing a message event.
	*
	* @extends Event
	*/
	var MessageEvent = class extends Event {
		/**
		* Create a new `MessageEvent`.
		*
		* @param {String} type The name of the event
		* @param {Object} [options] A dictionary object that allows for setting
		*     attributes via object members of the same name
		* @param {*} [options.data=null] The message content
		*/
		constructor(type, options = {}) {
			super(type);
			this[kData] = options.data === void 0 ? null : options.data;
		}
		/**
		* @type {*}
		*/
		get data() {
			return this[kData];
		}
	};
	Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
	module.exports = {
		CloseEvent,
		ErrorEvent,
		Event,
		EventTarget: {
			/**
			* Register an event listener.
			*
			* @param {String} type A string representing the event type to listen for
			* @param {(Function|Object)} handler The listener to add
			* @param {Object} [options] An options object specifies characteristics about
			*     the event listener
			* @param {Boolean} [options.once=false] A `Boolean` indicating that the
			*     listener should be invoked at most once after being added. If `true`,
			*     the listener would be automatically removed when invoked.
			* @public
			*/
			addEventListener(type, handler, options = {}) {
				for (const listener of this.listeners(type)) if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) return;
				let wrapper;
				if (type === "message") wrapper = function onMessage(data, isBinary) {
					const event = new MessageEvent("message", { data: isBinary ? data : data.toString() });
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "close") wrapper = function onClose(code, message) {
					const event = new CloseEvent("close", {
						code,
						reason: message.toString(),
						wasClean: this._closeFrameReceived && this._closeFrameSent
					});
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "error") wrapper = function onError(error) {
					const event = new ErrorEvent("error", {
						error,
						message: error.message
					});
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "open") wrapper = function onOpen() {
					const event = new Event("open");
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else return;
				wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
				wrapper[kListener] = handler;
				if (options.once) this.once(type, wrapper);
				else this.on(type, wrapper);
			},
			/**
			* Remove an event listener.
			*
			* @param {String} type A string representing the event type to remove
			* @param {(Function|Object)} handler The listener to remove
			* @public
			*/
			removeEventListener(type, handler) {
				for (const listener of this.listeners(type)) if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
					this.removeListener(type, listener);
					break;
				}
			}
		},
		MessageEvent
	};
	/**
	* Call an event listener
	*
	* @param {(Function|Object)} listener The listener to call
	* @param {*} thisArg The value to use as `this`` when calling the listener
	* @param {Event} event The event to pass to the listener
	* @private
	*/
	function callListener(listener, thisArg, event) {
		if (typeof listener === "object" && listener.handleEvent) listener.handleEvent.call(listener, event);
		else listener.call(thisArg, event);
	}
}));
//#endregion
//#region node_modules/ws/lib/extension.js
var require_extension = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { tokenChars } = require_validation();
	/**
	* Adds an offer to the map of extension offers or a parameter to the map of
	* parameters.
	*
	* @param {Object} dest The map of extension offers or parameters
	* @param {String} name The extension or parameter name
	* @param {(Object|Boolean|String)} elem The extension parameters or the
	*     parameter value
	* @private
	*/
	function push(dest, name, elem) {
		if (dest[name] === void 0) dest[name] = [elem];
		else dest[name].push(elem);
	}
	/**
	* Parses the `Sec-WebSocket-Extensions` header into an object.
	*
	* @param {String} header The field value of the header
	* @return {Object} The parsed object
	* @public
	*/
	function parse(header) {
		const offers = Object.create(null);
		let params = Object.create(null);
		let mustUnescape = false;
		let isEscaping = false;
		let inQuotes = false;
		let extensionName;
		let paramName;
		let start = -1;
		let code = -1;
		let end = -1;
		let i = 0;
		for (; i < header.length; i++) {
			code = header.charCodeAt(i);
			if (extensionName === void 0) {
				if (end === -1 && tokenChars[code] === 1) {
					if (start === -1) start = i;
				} else if (i !== 0 && (code === 32 || code === 9)) {
					if (end === -1 && start !== -1) end = i;
				} else if (code === 59 || code === 44) {
					if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
					if (end === -1) end = i;
					const name = header.slice(start, end);
					if (code === 44) {
						push(offers, name, params);
						params = Object.create(null);
					} else extensionName = name;
					start = end = -1;
				} else throw new SyntaxError(`Unexpected character at index ${i}`);
			} else if (paramName === void 0) {
				if (end === -1 && tokenChars[code] === 1) {
					if (start === -1) start = i;
				} else if (code === 32 || code === 9) {
					if (end === -1 && start !== -1) end = i;
				} else if (code === 59 || code === 44) {
					if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
					if (end === -1) end = i;
					push(params, header.slice(start, end), true);
					if (code === 44) {
						push(offers, extensionName, params);
						params = Object.create(null);
						extensionName = void 0;
					}
					start = end = -1;
				} else if (code === 61 && start !== -1 && end === -1) {
					paramName = header.slice(start, i);
					start = end = -1;
				} else throw new SyntaxError(`Unexpected character at index ${i}`);
			} else if (isEscaping) {
				if (tokenChars[code] !== 1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (start === -1) start = i;
				else if (!mustUnescape) mustUnescape = true;
				isEscaping = false;
			} else if (inQuotes) {
				if (tokenChars[code] === 1) {
					if (start === -1) start = i;
				} else if (code === 34 && start !== -1) {
					inQuotes = false;
					end = i;
				} else if (code === 92) isEscaping = true;
				else throw new SyntaxError(`Unexpected character at index ${i}`);
			} else if (code === 34 && header.charCodeAt(i - 1) === 61) inQuotes = true;
			else if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (start !== -1 && (code === 32 || code === 9)) {
				if (end === -1) end = i;
			} else if (code === 59 || code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				let value = header.slice(start, end);
				if (mustUnescape) {
					value = value.replace(/\\/g, "");
					mustUnescape = false;
				}
				push(params, paramName, value);
				if (code === 44) {
					push(offers, extensionName, params);
					params = Object.create(null);
					extensionName = void 0;
				}
				paramName = void 0;
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
		}
		if (start === -1 || inQuotes || code === 32 || code === 9) throw new SyntaxError("Unexpected end of input");
		if (end === -1) end = i;
		const token = header.slice(start, end);
		if (extensionName === void 0) push(offers, token, params);
		else {
			if (paramName === void 0) push(params, token, true);
			else if (mustUnescape) push(params, paramName, token.replace(/\\/g, ""));
			else push(params, paramName, token);
			push(offers, extensionName, params);
		}
		return offers;
	}
	/**
	* Builds the `Sec-WebSocket-Extensions` header field value.
	*
	* @param {Object} extensions The map of extensions and parameters to format
	* @return {String} A string representing the given object
	* @public
	*/
	function format(extensions) {
		return Object.keys(extensions).map((extension) => {
			let configurations = extensions[extension];
			if (!Array.isArray(configurations)) configurations = [configurations];
			return configurations.map((params) => {
				return [extension].concat(Object.keys(params).map((k) => {
					let values = params[k];
					if (!Array.isArray(values)) values = [values];
					return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
				})).join("; ");
			}).join(", ");
		}).join(", ");
	}
	module.exports = {
		format,
		parse
	};
}));
//#endregion
//#region node_modules/ws/lib/websocket.js
var require_websocket$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var EventEmitter$1 = require("events");
	var https = require("https");
	var http$1 = require("http");
	var net = require("net");
	var tls = require("tls");
	var { randomBytes, createHash: createHash$1 } = require("crypto");
	var { Duplex: Duplex$2, Readable } = require("stream");
	var { URL: URL$1 } = require("url");
	var PerMessageDeflate = require_permessage_deflate();
	var Receiver = require_receiver();
	var Sender = require_sender();
	var { isBlob } = require_validation();
	var { BINARY_TYPES, CLOSE_TIMEOUT, EMPTY_BUFFER, GUID, kForOnEventAttribute, kListener, kStatusCode, kWebSocket, NOOP } = require_constants();
	var { EventTarget: { addEventListener, removeEventListener } } = require_event_target();
	var { format, parse } = require_extension();
	var { toBuffer } = require_buffer_util();
	var kAborted = Symbol("kAborted");
	var protocolVersions = [8, 13];
	var readyStates = [
		"CONNECTING",
		"OPEN",
		"CLOSING",
		"CLOSED"
	];
	var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
	/**
	* Class representing a WebSocket.
	*
	* @extends EventEmitter
	*/
	var WebSocket = class WebSocket extends EventEmitter$1 {
		/**
		* Create a new `WebSocket`.
		*
		* @param {(String|URL)} address The URL to which to connect
		* @param {(String|String[])} [protocols] The subprotocols
		* @param {Object} [options] Connection options
		*/
		constructor(address, protocols, options) {
			super();
			this._binaryType = BINARY_TYPES[0];
			this._closeCode = 1006;
			this._closeFrameReceived = false;
			this._closeFrameSent = false;
			this._closeMessage = EMPTY_BUFFER;
			this._closeTimer = null;
			this._errorEmitted = false;
			this._extensions = {};
			this._paused = false;
			this._protocol = "";
			this._readyState = WebSocket.CONNECTING;
			this._receiver = null;
			this._sender = null;
			this._socket = null;
			if (address !== null) {
				this._bufferedAmount = 0;
				this._isServer = false;
				this._redirects = 0;
				if (protocols === void 0) protocols = [];
				else if (!Array.isArray(protocols)) {
					if (typeof protocols === "object" && protocols !== null) {
						options = protocols;
						protocols = [];
					} else protocols = [protocols];
				}
				initAsClient(this, address, protocols, options);
			} else {
				this._autoPong = options.autoPong;
				this._closeTimeout = options.closeTimeout;
				this._isServer = true;
			}
		}
		/**
		* For historical reasons, the custom "nodebuffer" type is used by the default
		* instead of "blob".
		*
		* @type {String}
		*/
		get binaryType() {
			return this._binaryType;
		}
		set binaryType(type) {
			if (!BINARY_TYPES.includes(type)) return;
			this._binaryType = type;
			if (this._receiver) this._receiver._binaryType = type;
		}
		/**
		* @type {Number}
		*/
		get bufferedAmount() {
			if (!this._socket) return this._bufferedAmount;
			return this._socket._writableState.length + this._sender._bufferedBytes;
		}
		/**
		* @type {String}
		*/
		get extensions() {
			return Object.keys(this._extensions).join();
		}
		/**
		* @type {Boolean}
		*/
		get isPaused() {
			return this._paused;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onclose() {
			return null;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onerror() {
			return null;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onopen() {
			return null;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onmessage() {
			return null;
		}
		/**
		* @type {String}
		*/
		get protocol() {
			return this._protocol;
		}
		/**
		* @type {Number}
		*/
		get readyState() {
			return this._readyState;
		}
		/**
		* @type {String}
		*/
		get url() {
			return this._url;
		}
		/**
		* Set up the socket and the internal resources.
		*
		* @param {Duplex} socket The network socket between the server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Object} options Options object
		* @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
		*     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
		*     multiple times in the same tick
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Number} [options.maxBufferedChunks=0] The maximum number of
		*     buffered data chunks
		* @param {Number} [options.maxFragments=0] The maximum number of message
		*     fragments
		* @param {Number} [options.maxPayload=0] The maximum allowed message size
		* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
		*     not to skip UTF-8 validation for text and close messages
		* @private
		*/
		setSocket(socket, head, options) {
			const receiver = new Receiver({
				allowSynchronousEvents: options.allowSynchronousEvents,
				binaryType: this.binaryType,
				extensions: this._extensions,
				isServer: this._isServer,
				maxBufferedChunks: options.maxBufferedChunks,
				maxFragments: options.maxFragments,
				maxPayload: options.maxPayload,
				skipUTF8Validation: options.skipUTF8Validation
			});
			const sender = new Sender(socket, this._extensions, options.generateMask);
			this._receiver = receiver;
			this._sender = sender;
			this._socket = socket;
			receiver[kWebSocket] = this;
			sender[kWebSocket] = this;
			socket[kWebSocket] = this;
			receiver.on("conclude", receiverOnConclude);
			receiver.on("drain", receiverOnDrain);
			receiver.on("error", receiverOnError);
			receiver.on("message", receiverOnMessage);
			receiver.on("ping", receiverOnPing);
			receiver.on("pong", receiverOnPong);
			sender.onerror = senderOnError;
			if (socket.setTimeout) socket.setTimeout(0);
			if (socket.setNoDelay) socket.setNoDelay();
			if (head.length > 0) socket.unshift(head);
			socket.on("close", socketOnClose);
			socket.on("data", socketOnData);
			socket.on("end", socketOnEnd);
			socket.on("error", socketOnError);
			this._readyState = WebSocket.OPEN;
			this.emit("open");
		}
		/**
		* Emit the `'close'` event.
		*
		* @private
		*/
		emitClose() {
			if (!this._socket) {
				this._readyState = WebSocket.CLOSED;
				this.emit("close", this._closeCode, this._closeMessage);
				return;
			}
			if (this._extensions[PerMessageDeflate.extensionName]) this._extensions[PerMessageDeflate.extensionName].cleanup();
			this._receiver.removeAllListeners();
			this._readyState = WebSocket.CLOSED;
			this.emit("close", this._closeCode, this._closeMessage);
		}
		/**
		* Start a closing handshake.
		*
		*          +----------+   +-----------+   +----------+
		*     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
		*    |     +----------+   +-----------+   +----------+     |
		*          +----------+   +-----------+         |
		* CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
		*          +----------+   +-----------+   |
		*    |           |                        |   +---+        |
		*                +------------------------+-->|fin| - - - -
		*    |         +---+                      |   +---+
		*     - - - - -|fin|<---------------------+
		*              +---+
		*
		* @param {Number} [code] Status code explaining why the connection is closing
		* @param {(String|Buffer)} [data] The reason why the connection is
		*     closing
		* @public
		*/
		close(code, data) {
			if (this.readyState === WebSocket.CLOSED) return;
			if (this.readyState === WebSocket.CONNECTING) {
				abortHandshake(this, this._req, "WebSocket was closed before the connection was established");
				return;
			}
			if (this.readyState === WebSocket.CLOSING) {
				if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) this._socket.end();
				return;
			}
			this._readyState = WebSocket.CLOSING;
			this._sender.close(code, data, !this._isServer, (err) => {
				if (err) return;
				this._closeFrameSent = true;
				if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) this._socket.end();
			});
			setCloseTimer(this);
		}
		/**
		* Pause the socket.
		*
		* @public
		*/
		pause() {
			if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) return;
			this._paused = true;
			this._socket.pause();
		}
		/**
		* Send a ping.
		*
		* @param {*} [data] The data to send
		* @param {Boolean} [mask] Indicates whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when the ping is sent
		* @public
		*/
		ping(data, mask, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof data === "function") {
				cb = data;
				data = mask = void 0;
			} else if (typeof mask === "function") {
				cb = mask;
				mask = void 0;
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			if (mask === void 0) mask = !this._isServer;
			this._sender.ping(data || EMPTY_BUFFER, mask, cb);
		}
		/**
		* Send a pong.
		*
		* @param {*} [data] The data to send
		* @param {Boolean} [mask] Indicates whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when the pong is sent
		* @public
		*/
		pong(data, mask, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof data === "function") {
				cb = data;
				data = mask = void 0;
			} else if (typeof mask === "function") {
				cb = mask;
				mask = void 0;
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			if (mask === void 0) mask = !this._isServer;
			this._sender.pong(data || EMPTY_BUFFER, mask, cb);
		}
		/**
		* Resume the socket.
		*
		* @public
		*/
		resume() {
			if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) return;
			this._paused = false;
			if (!this._receiver._writableState.needDrain) this._socket.resume();
		}
		/**
		* Send a data message.
		*
		* @param {*} data The message to send
		* @param {Object} [options] Options object
		* @param {Boolean} [options.binary] Specifies whether `data` is binary or
		*     text
		* @param {Boolean} [options.compress] Specifies whether or not to compress
		*     `data`
		* @param {Boolean} [options.fin=true] Specifies whether the fragment is the
		*     last one
		* @param {Boolean} [options.mask] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when data is written out
		* @public
		*/
		send(data, options, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof options === "function") {
				cb = options;
				options = {};
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			const opts = {
				binary: typeof data !== "string",
				mask: !this._isServer,
				compress: true,
				fin: true,
				...options
			};
			if (!this._extensions[PerMessageDeflate.extensionName]) opts.compress = false;
			this._sender.send(data || EMPTY_BUFFER, opts, cb);
		}
		/**
		* Forcibly close the connection.
		*
		* @public
		*/
		terminate() {
			if (this.readyState === WebSocket.CLOSED) return;
			if (this.readyState === WebSocket.CONNECTING) {
				abortHandshake(this, this._req, "WebSocket was closed before the connection was established");
				return;
			}
			if (this._socket) {
				this._readyState = WebSocket.CLOSING;
				this._socket.destroy();
			}
		}
	};
	/**
	* @constant {Number} CONNECTING
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CONNECTING", {
		enumerable: true,
		value: readyStates.indexOf("CONNECTING")
	});
	/**
	* @constant {Number} CONNECTING
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CONNECTING", {
		enumerable: true,
		value: readyStates.indexOf("CONNECTING")
	});
	/**
	* @constant {Number} OPEN
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "OPEN", {
		enumerable: true,
		value: readyStates.indexOf("OPEN")
	});
	/**
	* @constant {Number} OPEN
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "OPEN", {
		enumerable: true,
		value: readyStates.indexOf("OPEN")
	});
	/**
	* @constant {Number} CLOSING
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CLOSING", {
		enumerable: true,
		value: readyStates.indexOf("CLOSING")
	});
	/**
	* @constant {Number} CLOSING
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CLOSING", {
		enumerable: true,
		value: readyStates.indexOf("CLOSING")
	});
	/**
	* @constant {Number} CLOSED
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CLOSED", {
		enumerable: true,
		value: readyStates.indexOf("CLOSED")
	});
	/**
	* @constant {Number} CLOSED
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CLOSED", {
		enumerable: true,
		value: readyStates.indexOf("CLOSED")
	});
	[
		"binaryType",
		"bufferedAmount",
		"extensions",
		"isPaused",
		"protocol",
		"readyState",
		"url"
	].forEach((property) => {
		Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
	});
	[
		"open",
		"error",
		"close",
		"message"
	].forEach((method) => {
		Object.defineProperty(WebSocket.prototype, `on${method}`, {
			enumerable: true,
			get() {
				for (const listener of this.listeners(method)) if (listener[kForOnEventAttribute]) return listener[kListener];
				return null;
			},
			set(handler) {
				for (const listener of this.listeners(method)) if (listener[kForOnEventAttribute]) {
					this.removeListener(method, listener);
					break;
				}
				if (typeof handler !== "function") return;
				this.addEventListener(method, handler, { [kForOnEventAttribute]: true });
			}
		});
	});
	WebSocket.prototype.addEventListener = addEventListener;
	WebSocket.prototype.removeEventListener = removeEventListener;
	module.exports = WebSocket;
	/**
	* Initialize a WebSocket client.
	*
	* @param {WebSocket} websocket The client to initialize
	* @param {(String|URL)} address The URL to which to connect
	* @param {Array} protocols The subprotocols
	* @param {Object} [options] Connection options
	* @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether any
	*     of the `'message'`, `'ping'`, and `'pong'` events can be emitted multiple
	*     times in the same tick
	* @param {Boolean} [options.autoPong=true] Specifies whether or not to
	*     automatically send a pong in response to a ping
	* @param {Number} [options.closeTimeout=30000] Duration in milliseconds to wait
	*     for the closing handshake to finish after `websocket.close()` is called
	* @param {Function} [options.finishRequest] A function which can be used to
	*     customize the headers of each http request before it is sent
	* @param {Boolean} [options.followRedirects=false] Whether or not to follow
	*     redirects
	* @param {Function} [options.generateMask] The function used to generate the
	*     masking key
	* @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
	*     handshake request
	* @param {Number} [options.maxBufferedChunks=262144] The maximum number of
	*     buffered data chunks
	* @param {Number} [options.maxFragments=16384] The maximum number of message
	*     fragments
	* @param {Number} [options.maxPayload=104857600] The maximum allowed message
	*     size
	* @param {Number} [options.maxRedirects=10] The maximum number of redirects
	*     allowed
	* @param {String} [options.origin] Value of the `Origin` or
	*     `Sec-WebSocket-Origin` header
	* @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
	*     permessage-deflate
	* @param {Number} [options.protocolVersion=13] Value of the
	*     `Sec-WebSocket-Version` header
	* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
	*     not to skip UTF-8 validation for text and close messages
	* @private
	*/
	function initAsClient(websocket, address, protocols, options) {
		const opts = {
			allowSynchronousEvents: true,
			autoPong: true,
			closeTimeout: CLOSE_TIMEOUT,
			protocolVersion: protocolVersions[1],
			maxBufferedChunks: 262144,
			maxFragments: 16384,
			maxPayload: 104857600,
			skipUTF8Validation: false,
			perMessageDeflate: true,
			followRedirects: false,
			maxRedirects: 10,
			...options,
			socketPath: void 0,
			hostname: void 0,
			protocol: void 0,
			timeout: void 0,
			method: "GET",
			host: void 0,
			path: void 0,
			port: void 0
		};
		websocket._autoPong = opts.autoPong;
		websocket._closeTimeout = opts.closeTimeout;
		if (!protocolVersions.includes(opts.protocolVersion)) throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`);
		let parsedUrl;
		if (address instanceof URL$1) parsedUrl = address;
		else try {
			parsedUrl = new URL$1(address);
		} catch {
			throw new SyntaxError(`Invalid URL: ${address}`);
		}
		if (parsedUrl.protocol === "http:") parsedUrl.protocol = "ws:";
		else if (parsedUrl.protocol === "https:") parsedUrl.protocol = "wss:";
		websocket._url = parsedUrl.href;
		const isSecure = parsedUrl.protocol === "wss:";
		const isIpcUrl = parsedUrl.protocol === "ws+unix:";
		let invalidUrlMessage;
		if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) invalidUrlMessage = "The URL's protocol must be one of \"ws:\", \"wss:\", \"http:\", \"https:\", or \"ws+unix:\"";
		else if (isIpcUrl && !parsedUrl.pathname) invalidUrlMessage = "The URL's pathname is empty";
		else if (parsedUrl.hash) invalidUrlMessage = "The URL contains a fragment identifier";
		if (invalidUrlMessage) {
			const err = new SyntaxError(invalidUrlMessage);
			if (websocket._redirects === 0) throw err;
			else {
				emitErrorAndClose(websocket, err);
				return;
			}
		}
		const defaultPort = isSecure ? 443 : 80;
		const key = randomBytes(16).toString("base64");
		const request = isSecure ? https.request : http$1.request;
		const protocolSet = /* @__PURE__ */ new Set();
		let perMessageDeflate;
		opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
		opts.defaultPort = opts.defaultPort || defaultPort;
		opts.port = parsedUrl.port || defaultPort;
		opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
		opts.headers = {
			...opts.headers,
			"Sec-WebSocket-Version": opts.protocolVersion,
			"Sec-WebSocket-Key": key,
			Connection: "Upgrade",
			Upgrade: "websocket"
		};
		opts.path = parsedUrl.pathname + parsedUrl.search;
		opts.timeout = opts.handshakeTimeout;
		if (opts.perMessageDeflate) {
			perMessageDeflate = new PerMessageDeflate({
				...opts.perMessageDeflate,
				isServer: false,
				maxPayload: opts.maxPayload
			});
			opts.headers["Sec-WebSocket-Extensions"] = format({ [PerMessageDeflate.extensionName]: perMessageDeflate.offer() });
		}
		if (protocols.length) {
			for (const protocol of protocols) {
				if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) throw new SyntaxError("An invalid or duplicated subprotocol was specified");
				protocolSet.add(protocol);
			}
			opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
		}
		if (opts.origin) {
			if (opts.protocolVersion < 13) opts.headers["Sec-WebSocket-Origin"] = opts.origin;
			else opts.headers.Origin = opts.origin;
		}
		if (parsedUrl.username || parsedUrl.password) opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
		if (isIpcUrl) {
			const parts = opts.path.split(":");
			opts.socketPath = parts[0];
			opts.path = parts[1];
		}
		let req;
		if (opts.followRedirects) {
			if (websocket._redirects === 0) {
				websocket._originalIpc = isIpcUrl;
				websocket._originalSecure = isSecure;
				websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
				const headers = options && options.headers;
				options = {
					...options,
					headers: {}
				};
				if (headers) for (const [key, value] of Object.entries(headers)) options.headers[key.toLowerCase()] = value;
			} else if (websocket.listenerCount("redirect") === 0) {
				const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
				if (!isSameHost || websocket._originalSecure && !isSecure) {
					delete opts.headers.authorization;
					delete opts.headers.cookie;
					if (!isSameHost) delete opts.headers.host;
					opts.auth = void 0;
				}
			}
			if (opts.auth && !options.headers.authorization) options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
			req = websocket._req = request(opts);
			if (websocket._redirects) websocket.emit("redirect", websocket.url, req);
		} else req = websocket._req = request(opts);
		if (opts.timeout) req.on("timeout", () => {
			abortHandshake(websocket, req, "Opening handshake has timed out");
		});
		req.on("error", (err) => {
			if (req === null || req[kAborted]) return;
			req = websocket._req = null;
			emitErrorAndClose(websocket, err);
		});
		req.on("response", (res) => {
			const location = res.headers.location;
			const statusCode = res.statusCode;
			if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
				if (++websocket._redirects > opts.maxRedirects) {
					abortHandshake(websocket, req, "Maximum redirects exceeded");
					return;
				}
				req.abort();
				let addr;
				try {
					addr = new URL$1(location, address);
				} catch (e) {
					emitErrorAndClose(websocket, /* @__PURE__ */ new SyntaxError(`Invalid URL: ${location}`));
					return;
				}
				initAsClient(websocket, addr, protocols, options);
			} else if (!websocket.emit("unexpected-response", req, res)) abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
		});
		req.on("upgrade", (res, socket, head) => {
			websocket.emit("upgrade", res);
			if (websocket.readyState !== WebSocket.CONNECTING) return;
			req = websocket._req = null;
			const upgrade = res.headers.upgrade;
			if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
				abortHandshake(websocket, socket, "Invalid Upgrade header");
				return;
			}
			const digest = createHash$1("sha1").update(key + GUID).digest("base64");
			if (res.headers["sec-websocket-accept"] !== digest) {
				abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
				return;
			}
			const serverProt = res.headers["sec-websocket-protocol"];
			let protError;
			if (serverProt !== void 0) {
				if (!protocolSet.size) protError = "Server sent a subprotocol but none was requested";
				else if (!protocolSet.has(serverProt)) protError = "Server sent an invalid subprotocol";
			} else if (protocolSet.size) protError = "Server sent no subprotocol";
			if (protError) {
				abortHandshake(websocket, socket, protError);
				return;
			}
			if (serverProt) websocket._protocol = serverProt;
			const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
			if (secWebSocketExtensions !== void 0) {
				if (!perMessageDeflate) {
					abortHandshake(websocket, socket, "Server sent a Sec-WebSocket-Extensions header but no extension was requested");
					return;
				}
				let extensions;
				try {
					extensions = parse(secWebSocketExtensions);
				} catch (err) {
					abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Extensions header");
					return;
				}
				const extensionNames = Object.keys(extensions);
				if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
					abortHandshake(websocket, socket, "Server indicated an extension that was not requested");
					return;
				}
				try {
					perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
				} catch (err) {
					abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Extensions header");
					return;
				}
				websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
			}
			websocket.setSocket(socket, head, {
				allowSynchronousEvents: opts.allowSynchronousEvents,
				generateMask: opts.generateMask,
				maxBufferedChunks: opts.maxBufferedChunks,
				maxFragments: opts.maxFragments,
				maxPayload: opts.maxPayload,
				skipUTF8Validation: opts.skipUTF8Validation
			});
		});
		if (opts.finishRequest) opts.finishRequest(req, websocket);
		else req.end();
	}
	/**
	* Emit the `'error'` and `'close'` events.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {Error} The error to emit
	* @private
	*/
	function emitErrorAndClose(websocket, err) {
		websocket._readyState = WebSocket.CLOSING;
		websocket._errorEmitted = true;
		websocket.emit("error", err);
		websocket.emitClose();
	}
	/**
	* Create a `net.Socket` and initiate a connection.
	*
	* @param {Object} options Connection options
	* @return {net.Socket} The newly created socket used to start the connection
	* @private
	*/
	function netConnect(options) {
		options.path = options.socketPath;
		return net.connect(options);
	}
	/**
	* Create a `tls.TLSSocket` and initiate a connection.
	*
	* @param {Object} options Connection options
	* @return {tls.TLSSocket} The newly created socket used to start the connection
	* @private
	*/
	function tlsConnect(options) {
		options.path = void 0;
		if (!options.servername && options.servername !== "") options.servername = net.isIP(options.host) ? "" : options.host;
		return tls.connect(options);
	}
	/**
	* Abort the handshake and emit an error.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
	*     abort or the socket to destroy
	* @param {String} message The error message
	* @private
	*/
	function abortHandshake(websocket, stream, message) {
		websocket._readyState = WebSocket.CLOSING;
		const err = new Error(message);
		Error.captureStackTrace(err, abortHandshake);
		if (stream.setHeader) {
			stream[kAborted] = true;
			stream.abort();
			if (stream.socket && !stream.socket.destroyed) stream.socket.destroy();
			process.nextTick(emitErrorAndClose, websocket, err);
		} else {
			stream.destroy(err);
			stream.once("error", websocket.emit.bind(websocket, "error"));
			stream.once("close", websocket.emitClose.bind(websocket));
		}
	}
	/**
	* Handle cases where the `ping()`, `pong()`, or `send()` methods are called
	* when the `readyState` attribute is `CLOSING` or `CLOSED`.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {*} [data] The data to send
	* @param {Function} [cb] Callback
	* @private
	*/
	function sendAfterClose(websocket, data, cb) {
		if (data) {
			const length = isBlob(data) ? data.size : toBuffer(data).length;
			if (websocket._socket) websocket._sender._bufferedBytes += length;
			else websocket._bufferedAmount += length;
		}
		if (cb) {
			const err = /* @__PURE__ */ new Error(`WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`);
			process.nextTick(cb, err);
		}
	}
	/**
	* The listener of the `Receiver` `'conclude'` event.
	*
	* @param {Number} code The status code
	* @param {Buffer} reason The reason for closing
	* @private
	*/
	function receiverOnConclude(code, reason) {
		const websocket = this[kWebSocket];
		websocket._closeFrameReceived = true;
		websocket._closeMessage = reason;
		websocket._closeCode = code;
		if (websocket._socket[kWebSocket] === void 0) return;
		websocket._socket.removeListener("data", socketOnData);
		process.nextTick(resume, websocket._socket);
		if (code === 1005) websocket.close();
		else websocket.close(code, reason);
	}
	/**
	* The listener of the `Receiver` `'drain'` event.
	*
	* @private
	*/
	function receiverOnDrain() {
		const websocket = this[kWebSocket];
		if (!websocket.isPaused) websocket._socket.resume();
	}
	/**
	* The listener of the `Receiver` `'error'` event.
	*
	* @param {(RangeError|Error)} err The emitted error
	* @private
	*/
	function receiverOnError(err) {
		const websocket = this[kWebSocket];
		if (websocket._socket[kWebSocket] !== void 0) {
			websocket._socket.removeListener("data", socketOnData);
			process.nextTick(resume, websocket._socket);
			websocket.close(err[kStatusCode]);
		}
		if (!websocket._errorEmitted) {
			websocket._errorEmitted = true;
			websocket.emit("error", err);
		}
	}
	/**
	* The listener of the `Receiver` `'finish'` event.
	*
	* @private
	*/
	function receiverOnFinish() {
		this[kWebSocket].emitClose();
	}
	/**
	* The listener of the `Receiver` `'message'` event.
	*
	* @param {Buffer|ArrayBuffer|Buffer[])} data The message
	* @param {Boolean} isBinary Specifies whether the message is binary or not
	* @private
	*/
	function receiverOnMessage(data, isBinary) {
		this[kWebSocket].emit("message", data, isBinary);
	}
	/**
	* The listener of the `Receiver` `'ping'` event.
	*
	* @param {Buffer} data The data included in the ping frame
	* @private
	*/
	function receiverOnPing(data) {
		const websocket = this[kWebSocket];
		if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
		websocket.emit("ping", data);
	}
	/**
	* The listener of the `Receiver` `'pong'` event.
	*
	* @param {Buffer} data The data included in the pong frame
	* @private
	*/
	function receiverOnPong(data) {
		this[kWebSocket].emit("pong", data);
	}
	/**
	* Resume a readable stream
	*
	* @param {Readable} stream The readable stream
	* @private
	*/
	function resume(stream) {
		stream.resume();
	}
	/**
	* The `Sender` error event handler.
	*
	* @param {Error} The error
	* @private
	*/
	function senderOnError(err) {
		const websocket = this[kWebSocket];
		if (websocket.readyState === WebSocket.CLOSED) return;
		if (websocket.readyState === WebSocket.OPEN) {
			websocket._readyState = WebSocket.CLOSING;
			setCloseTimer(websocket);
		}
		this._socket.end();
		if (!websocket._errorEmitted) {
			websocket._errorEmitted = true;
			websocket.emit("error", err);
		}
	}
	/**
	* Set a timer to destroy the underlying raw socket of a WebSocket.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @private
	*/
	function setCloseTimer(websocket) {
		websocket._closeTimer = setTimeout(websocket._socket.destroy.bind(websocket._socket), websocket._closeTimeout);
	}
	/**
	* The listener of the socket `'close'` event.
	*
	* @private
	*/
	function socketOnClose() {
		const websocket = this[kWebSocket];
		this.removeListener("close", socketOnClose);
		this.removeListener("data", socketOnData);
		this.removeListener("end", socketOnEnd);
		websocket._readyState = WebSocket.CLOSING;
		if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
			const chunk = this.read(this._readableState.length);
			websocket._receiver.write(chunk);
		}
		websocket._receiver.end();
		this[kWebSocket] = void 0;
		clearTimeout(websocket._closeTimer);
		if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) websocket.emitClose();
		else {
			websocket._receiver.on("error", receiverOnFinish);
			websocket._receiver.on("finish", receiverOnFinish);
		}
	}
	/**
	* The listener of the socket `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function socketOnData(chunk) {
		if (!this[kWebSocket]._receiver.write(chunk)) this.pause();
	}
	/**
	* The listener of the socket `'end'` event.
	*
	* @private
	*/
	function socketOnEnd() {
		const websocket = this[kWebSocket];
		websocket._readyState = WebSocket.CLOSING;
		websocket._receiver.end();
		this.end();
	}
	/**
	* The listener of the socket `'error'` event.
	*
	* @private
	*/
	function socketOnError() {
		const websocket = this[kWebSocket];
		this.removeListener("error", socketOnError);
		this.on("error", NOOP);
		if (websocket) {
			websocket._readyState = WebSocket.CLOSING;
			this.destroy();
		}
	}
}));
//#endregion
//#region node_modules/ws/lib/stream.js
var require_stream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	require_websocket$1();
	var { Duplex: Duplex$1 } = require("stream");
	/**
	* Emits the `'close'` event on a stream.
	*
	* @param {Duplex} stream The stream.
	* @private
	*/
	function emitClose(stream) {
		stream.emit("close");
	}
	/**
	* The listener of the `'end'` event.
	*
	* @private
	*/
	function duplexOnEnd() {
		if (!this.destroyed && this._writableState.finished) this.destroy();
	}
	/**
	* The listener of the `'error'` event.
	*
	* @param {Error} err The error
	* @private
	*/
	function duplexOnError(err) {
		this.removeListener("error", duplexOnError);
		this.destroy();
		if (this.listenerCount("error") === 0) this.emit("error", err);
	}
	/**
	* Wraps a `WebSocket` in a duplex stream.
	*
	* @param {WebSocket} ws The `WebSocket` to wrap
	* @param {Object} [options] The options for the `Duplex` constructor
	* @return {Duplex} The duplex stream
	* @public
	*/
	function createWebSocketStream(ws, options) {
		let terminateOnDestroy = true;
		const duplex = new Duplex$1({
			...options,
			autoDestroy: false,
			emitClose: false,
			objectMode: false,
			writableObjectMode: false
		});
		ws.on("message", function message(msg, isBinary) {
			const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
			if (!duplex.push(data)) ws.pause();
		});
		ws.once("error", function error(err) {
			if (duplex.destroyed) return;
			terminateOnDestroy = false;
			duplex.destroy(err);
		});
		ws.once("close", function close() {
			if (duplex.destroyed) return;
			duplex.push(null);
		});
		duplex._destroy = function(err, callback) {
			if (ws.readyState === ws.CLOSED) {
				callback(err);
				process.nextTick(emitClose, duplex);
				return;
			}
			let called = false;
			ws.once("error", function error(err) {
				called = true;
				callback(err);
			});
			ws.once("close", function close() {
				if (!called) callback(err);
				process.nextTick(emitClose, duplex);
			});
			if (terminateOnDestroy) ws.terminate();
		};
		duplex._final = function(callback) {
			if (ws.readyState === ws.CONNECTING) {
				ws.once("open", function open() {
					duplex._final(callback);
				});
				return;
			}
			if (ws._socket === null) return;
			if (ws._socket._writableState.finished) {
				callback();
				if (duplex._readableState.endEmitted) duplex.destroy();
			} else {
				ws._socket.once("finish", function finish() {
					callback();
				});
				ws.close();
			}
		};
		duplex._read = function() {
			if (ws.isPaused) ws.resume();
		};
		duplex._write = function(chunk, encoding, callback) {
			if (ws.readyState === ws.CONNECTING) {
				ws.once("open", function open() {
					duplex._write(chunk, encoding, callback);
				});
				return;
			}
			ws.send(chunk, callback);
		};
		duplex.on("end", duplexOnEnd);
		duplex.on("error", duplexOnError);
		return duplex;
	}
	module.exports = createWebSocketStream;
}));
//#endregion
//#region node_modules/ws/lib/subprotocol.js
var require_subprotocol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { tokenChars } = require_validation();
	/**
	* Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.
	*
	* @param {String} header The field value of the header
	* @return {Set} The subprotocol names
	* @public
	*/
	function parse(header) {
		const protocols = /* @__PURE__ */ new Set();
		let start = -1;
		let end = -1;
		let i = 0;
		for (; i < header.length; i++) {
			const code = header.charCodeAt(i);
			if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (i !== 0 && (code === 32 || code === 9)) {
				if (end === -1 && start !== -1) end = i;
			} else if (code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				const protocol = header.slice(start, end);
				if (protocols.has(protocol)) throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
				protocols.add(protocol);
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
		}
		if (start === -1 || end !== -1) throw new SyntaxError("Unexpected end of input");
		const protocol = header.slice(start, i);
		if (protocols.has(protocol)) throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
		protocols.add(protocol);
		return protocols;
	}
	module.exports = { parse };
}));
//#endregion
//#region node_modules/ws/lib/websocket-server.js
var require_websocket_server = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var EventEmitter = require("events");
	var http = require("http");
	var { Duplex } = require("stream");
	var { createHash } = require("crypto");
	var extension = require_extension();
	var PerMessageDeflate = require_permessage_deflate();
	var subprotocol = require_subprotocol();
	var WebSocket = require_websocket$1();
	var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
	var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
	var RUNNING = 0;
	var CLOSING = 1;
	var CLOSED = 2;
	/**
	* Class representing a WebSocket server.
	*
	* @extends EventEmitter
	*/
	var WebSocketServer = class extends EventEmitter {
		/**
		* Create a `WebSocketServer` instance.
		*
		* @param {Object} options Configuration options
		* @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
		*     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
		*     multiple times in the same tick
		* @param {Boolean} [options.autoPong=true] Specifies whether or not to
		*     automatically send a pong in response to a ping
		* @param {Number} [options.backlog=511] The maximum length of the queue of
		*     pending connections
		* @param {Boolean} [options.clientTracking=true] Specifies whether or not to
		*     track clients
		* @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
		*     wait for the closing handshake to finish after `websocket.close()` is
		*     called
		* @param {Function} [options.handleProtocols] A hook to handle protocols
		* @param {String} [options.host] The hostname where to bind the server
		* @param {Number} [options.maxBufferedChunks=262144] The maximum number of
		*     buffered data chunks
		* @param {Number} [options.maxFragments=16384] The maximum number of message
		*     fragments
		* @param {Number} [options.maxPayload=104857600] The maximum allowed message
		*     size
		* @param {Boolean} [options.noServer=false] Enable no server mode
		* @param {String} [options.path] Accept only connections matching this path
		* @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
		*     permessage-deflate
		* @param {Number} [options.port] The port where to bind the server
		* @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
		*     server to use
		* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
		*     not to skip UTF-8 validation for text and close messages
		* @param {Function} [options.verifyClient] A hook to reject connections
		* @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
		*     class to use. It must be the `WebSocket` class or class that extends it
		* @param {Function} [callback] A listener for the `listening` event
		*/
		constructor(options, callback) {
			super();
			options = {
				allowSynchronousEvents: true,
				autoPong: true,
				maxBufferedChunks: 262144,
				maxFragments: 16384,
				maxPayload: 104857600,
				skipUTF8Validation: false,
				perMessageDeflate: false,
				handleProtocols: null,
				clientTracking: true,
				closeTimeout: CLOSE_TIMEOUT,
				verifyClient: null,
				noServer: false,
				backlog: null,
				server: null,
				host: null,
				path: null,
				port: null,
				WebSocket,
				...options
			};
			if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) throw new TypeError("One and only one of the \"port\", \"server\", or \"noServer\" options must be specified");
			if (options.port != null) {
				this._server = http.createServer((req, res) => {
					const body = http.STATUS_CODES[426];
					res.writeHead(426, {
						"Content-Length": body.length,
						"Content-Type": "text/plain"
					});
					res.end(body);
				});
				this._server.listen(options.port, options.host, options.backlog, callback);
			} else if (options.server) this._server = options.server;
			if (this._server) {
				const emitConnection = this.emit.bind(this, "connection");
				this._removeListeners = addListeners(this._server, {
					listening: this.emit.bind(this, "listening"),
					error: this.emit.bind(this, "error"),
					upgrade: (req, socket, head) => {
						this.handleUpgrade(req, socket, head, emitConnection);
					}
				});
			}
			if (options.perMessageDeflate === true) options.perMessageDeflate = {};
			if (options.clientTracking) {
				this.clients = /* @__PURE__ */ new Set();
				this._shouldEmitClose = false;
			}
			this.options = options;
			this._state = RUNNING;
		}
		/**
		* Returns the bound address, the address family name, and port of the server
		* as reported by the operating system if listening on an IP socket.
		* If the server is listening on a pipe or UNIX domain socket, the name is
		* returned as a string.
		*
		* @return {(Object|String|null)} The address of the server
		* @public
		*/
		address() {
			if (this.options.noServer) throw new Error("The server is operating in \"noServer\" mode");
			if (!this._server) return null;
			return this._server.address();
		}
		/**
		* Stop the server from accepting new connections and emit the `'close'` event
		* when all existing connections are closed.
		*
		* @param {Function} [cb] A one-time listener for the `'close'` event
		* @public
		*/
		close(cb) {
			if (this._state === CLOSED) {
				if (cb) this.once("close", () => {
					cb(/* @__PURE__ */ new Error("The server is not running"));
				});
				process.nextTick(emitClose, this);
				return;
			}
			if (cb) this.once("close", cb);
			if (this._state === CLOSING) return;
			this._state = CLOSING;
			if (this.options.noServer || this.options.server) {
				if (this._server) {
					this._removeListeners();
					this._removeListeners = this._server = null;
				}
				if (this.clients) {
					if (!this.clients.size) process.nextTick(emitClose, this);
					else this._shouldEmitClose = true;
				} else process.nextTick(emitClose, this);
			} else {
				const server = this._server;
				this._removeListeners();
				this._removeListeners = this._server = null;
				server.close(() => {
					emitClose(this);
				});
			}
		}
		/**
		* See if a given request should be handled by this server instance.
		*
		* @param {http.IncomingMessage} req Request object to inspect
		* @return {Boolean} `true` if the request is valid, else `false`
		* @public
		*/
		shouldHandle(req) {
			if (this.options.path) {
				const index = req.url.indexOf("?");
				if ((index !== -1 ? req.url.slice(0, index) : req.url) !== this.options.path) return false;
			}
			return true;
		}
		/**
		* Handle a HTTP Upgrade request.
		*
		* @param {http.IncomingMessage} req The request object
		* @param {Duplex} socket The network socket between the server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Function} cb Callback
		* @public
		*/
		handleUpgrade(req, socket, head, cb) {
			socket.on("error", socketOnError);
			const key = req.headers["sec-websocket-key"];
			const upgrade = req.headers.upgrade;
			const version = +req.headers["sec-websocket-version"];
			if (req.method !== "GET") {
				abortHandshakeOrEmitwsClientError(this, req, socket, 405, "Invalid HTTP method");
				return;
			}
			if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid Upgrade header");
				return;
			}
			if (key === void 0 || !keyRegex.test(key)) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Missing or invalid Sec-WebSocket-Key header");
				return;
			}
			if (version !== 13 && version !== 8) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Missing or invalid Sec-WebSocket-Version header", { "Sec-WebSocket-Version": "13, 8" });
				return;
			}
			if (!this.shouldHandle(req)) {
				abortHandshake(socket, 400);
				return;
			}
			const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
			let protocols = /* @__PURE__ */ new Set();
			if (secWebSocketProtocol !== void 0) try {
				protocols = subprotocol.parse(secWebSocketProtocol);
			} catch (err) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid Sec-WebSocket-Protocol header");
				return;
			}
			const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
			const extensions = {};
			if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
				const perMessageDeflate = new PerMessageDeflate({
					...this.options.perMessageDeflate,
					isServer: true,
					maxPayload: this.options.maxPayload
				});
				try {
					const offers = extension.parse(secWebSocketExtensions);
					if (offers[PerMessageDeflate.extensionName]) {
						perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
						extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
					}
				} catch (err) {
					abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid or unacceptable Sec-WebSocket-Extensions header");
					return;
				}
			}
			if (this.options.verifyClient) {
				const info = {
					origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
					secure: !!(req.socket.authorized || req.socket.encrypted),
					req
				};
				if (this.options.verifyClient.length === 2) {
					this.options.verifyClient(info, (verified, code, message, headers) => {
						if (!verified) return abortHandshake(socket, code || 401, message, headers);
						this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
					});
					return;
				}
				if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
			}
			this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
		}
		/**
		* Upgrade the connection to WebSocket.
		*
		* @param {Object} extensions The accepted extensions
		* @param {String} key The value of the `Sec-WebSocket-Key` header
		* @param {Set} protocols The subprotocols
		* @param {http.IncomingMessage} req The request object
		* @param {Duplex} socket The network socket between the server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Function} cb Callback
		* @throws {Error} If called more than once with the same socket
		* @private
		*/
		completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
			if (!socket.readable || !socket.writable) return socket.destroy();
			if (socket[kWebSocket]) throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
			if (this._state > RUNNING) return abortHandshake(socket, 503);
			const headers = [
				"HTTP/1.1 101 Switching Protocols",
				"Upgrade: websocket",
				"Connection: Upgrade",
				`Sec-WebSocket-Accept: ${createHash("sha1").update(key + GUID).digest("base64")}`
			];
			const ws = new this.options.WebSocket(null, void 0, this.options);
			if (protocols.size) {
				const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
				if (protocol) {
					headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
					ws._protocol = protocol;
				}
			}
			if (extensions[PerMessageDeflate.extensionName]) {
				const params = extensions[PerMessageDeflate.extensionName].params;
				const value = extension.format({ [PerMessageDeflate.extensionName]: [params] });
				headers.push(`Sec-WebSocket-Extensions: ${value}`);
				ws._extensions = extensions;
			}
			this.emit("headers", headers, req);
			socket.write(headers.concat("\r\n").join("\r\n"));
			socket.removeListener("error", socketOnError);
			ws.setSocket(socket, head, {
				allowSynchronousEvents: this.options.allowSynchronousEvents,
				maxBufferedChunks: this.options.maxBufferedChunks,
				maxFragments: this.options.maxFragments,
				maxPayload: this.options.maxPayload,
				skipUTF8Validation: this.options.skipUTF8Validation
			});
			if (this.clients) {
				this.clients.add(ws);
				ws.on("close", () => {
					this.clients.delete(ws);
					if (this._shouldEmitClose && !this.clients.size) process.nextTick(emitClose, this);
				});
			}
			cb(ws, req);
		}
	};
	module.exports = WebSocketServer;
	/**
	* Add event listeners on an `EventEmitter` using a map of <event, listener>
	* pairs.
	*
	* @param {EventEmitter} server The event emitter
	* @param {Object.<String, Function>} map The listeners to add
	* @return {Function} A function that will remove the added listeners when
	*     called
	* @private
	*/
	function addListeners(server, map) {
		for (const event of Object.keys(map)) server.on(event, map[event]);
		return function removeListeners() {
			for (const event of Object.keys(map)) server.removeListener(event, map[event]);
		};
	}
	/**
	* Emit a `'close'` event on an `EventEmitter`.
	*
	* @param {EventEmitter} server The event emitter
	* @private
	*/
	function emitClose(server) {
		server._state = CLOSED;
		server.emit("close");
	}
	/**
	* Handle socket errors.
	*
	* @private
	*/
	function socketOnError() {
		this.destroy();
	}
	/**
	* Close the connection when preconditions are not fulfilled.
	*
	* @param {Duplex} socket The socket of the upgrade request
	* @param {Number} code The HTTP response status code
	* @param {String} [message] The HTTP response body
	* @param {Object} [headers] Additional HTTP response headers
	* @private
	*/
	function abortHandshake(socket, code, message, headers) {
		message = message || http.STATUS_CODES[code];
		headers = {
			Connection: "close",
			"Content-Type": "text/html",
			"Content-Length": Buffer.byteLength(message),
			...headers
		};
		socket.once("finish", socket.destroy);
		socket.end(`HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message);
	}
	/**
	* Emit a `'wsClientError'` event on a `WebSocketServer` if there is at least
	* one listener for it, otherwise call `abortHandshake()`.
	*
	* @param {WebSocketServer} server The WebSocket server
	* @param {http.IncomingMessage} req The request object
	* @param {Duplex} socket The socket of the upgrade request
	* @param {Number} code The HTTP response status code
	* @param {String} message The HTTP response body
	* @param {Object} [headers] The HTTP response headers
	* @private
	*/
	function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
		if (server.listenerCount("wsClientError")) {
			const err = new Error(message);
			Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
			server.emit("wsClientError", err, socket, req);
		} else abortHandshake(socket, code, message, headers);
	}
}));
//#endregion
//#region node_modules/ws/index.js
var require_ws = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var createWebSocketStream = require_stream();
	var extension = require_extension();
	var PerMessageDeflate = require_permessage_deflate();
	var Receiver = require_receiver();
	var Sender = require_sender();
	var subprotocol = require_subprotocol();
	var WebSocket = require_websocket$1();
	var WebSocketServer = require_websocket_server();
	WebSocket.createWebSocketStream = createWebSocketStream;
	WebSocket.extension = extension;
	WebSocket.PerMessageDeflate = PerMessageDeflate;
	WebSocket.Receiver = Receiver;
	WebSocket.Sender = Sender;
	WebSocket.Server = WebSocketServer;
	WebSocket.subprotocol = subprotocol;
	WebSocket.WebSocket = WebSocket;
	WebSocket.WebSocketServer = WebSocketServer;
	module.exports = WebSocket;
}));
//#endregion
//#region node_modules/object-assign/index.js
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var require_object_assign = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;
	function toObject(val) {
		if (val === null || val === void 0) throw new TypeError("Object.assign cannot be called with null or undefined");
		return Object(val);
	}
	function shouldUseNative() {
		try {
			if (!Object.assign) return false;
			var test1 = /* @__PURE__ */ new String("abc");
			test1[5] = "de";
			if (Object.getOwnPropertyNames(test1)[0] === "5") return false;
			var test2 = {};
			for (var i = 0; i < 10; i++) test2["_" + String.fromCharCode(i)] = i;
			if (Object.getOwnPropertyNames(test2).map(function(n) {
				return test2[n];
			}).join("") !== "0123456789") return false;
			var test3 = {};
			"abcdefghijklmnopqrst".split("").forEach(function(letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") return false;
			return true;
		} catch (err) {
			return false;
		}
	}
	module.exports = shouldUseNative() ? Object.assign : function(target, source) {
		var from;
		var to = toObject(target);
		var symbols;
		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);
			for (var key in from) if (hasOwnProperty.call(from, key)) to[key] = from[key];
			if (getOwnPropertySymbols) {
				symbols = getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) if (propIsEnumerable.call(from, symbols[i])) to[symbols[i]] = from[symbols[i]];
			}
		}
		return to;
	};
}));
//#endregion
//#region node_modules/vary/index.js
/*!
* vary
* Copyright(c) 2014-2017 Douglas Christopher Wilson
* MIT Licensed
*/
var require_vary = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Module exports.
	*/
	module.exports = vary;
	module.exports.append = append;
	/**
	* RegExp to match field-name in RFC 7230 sec 3.2
	*
	* field-name    = token
	* token         = 1*tchar
	* tchar         = "!" / "#" / "$" / "%" / "&" / "'" / "*"
	*               / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
	*               / DIGIT / ALPHA
	*               ; any VCHAR, except delimiters
	*/
	var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
	/**
	* Append a field to a vary header.
	*
	* @param {String} header
	* @param {String|Array} field
	* @return {String}
	* @public
	*/
	function append(header, field) {
		if (typeof header !== "string") throw new TypeError("header argument is required");
		if (!field) throw new TypeError("field argument is required");
		var fields = !Array.isArray(field) ? parse(String(field)) : field;
		for (var j = 0; j < fields.length; j++) if (!FIELD_NAME_REGEXP.test(fields[j])) throw new TypeError("field argument contains an invalid header name");
		if (header === "*") return header;
		var val = header;
		var vals = parse(header.toLowerCase());
		if (fields.indexOf("*") !== -1 || vals.indexOf("*") !== -1) return "*";
		for (var i = 0; i < fields.length; i++) {
			var fld = fields[i].toLowerCase();
			if (vals.indexOf(fld) === -1) {
				vals.push(fld);
				val = val ? val + ", " + fields[i] : fields[i];
			}
		}
		return val;
	}
	/**
	* Parse a vary header into an array.
	*
	* @param {String} header
	* @return {Array}
	* @private
	*/
	function parse(header) {
		var end = 0;
		var list = [];
		var start = 0;
		for (var i = 0, len = header.length; i < len; i++) switch (header.charCodeAt(i)) {
			case 32:
				if (start === end) start = end = i + 1;
				break;
			case 44:
				list.push(header.substring(start, end));
				start = end = i + 1;
				break;
			default: end = i + 1;
		}
		list.push(header.substring(start, end));
		return list;
	}
	/**
	* Mark that a request is varied on a header field.
	*
	* @param {Object} res
	* @param {String|Array} field
	* @public
	*/
	function vary(res, field) {
		if (!res || !res.getHeader || !res.setHeader) throw new TypeError("res argument is required");
		var val = res.getHeader("Vary") || "";
		if (val = append(Array.isArray(val) ? val.join(", ") : String(val), field)) res.setHeader("Vary", val);
	}
}));
//#endregion
//#region node_modules/cors/lib/index.js
var require_lib = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function() {
		"use strict";
		var assign = require_object_assign();
		var vary = require_vary();
		var defaults = {
			origin: "*",
			methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
			preflightContinue: false,
			optionsSuccessStatus: 204
		};
		function isString(s) {
			return typeof s === "string" || s instanceof String;
		}
		function isOriginAllowed(origin, allowedOrigin) {
			if (Array.isArray(allowedOrigin)) {
				for (var i = 0; i < allowedOrigin.length; ++i) if (isOriginAllowed(origin, allowedOrigin[i])) return true;
				return false;
			} else if (isString(allowedOrigin)) return origin === allowedOrigin;
			else if (allowedOrigin instanceof RegExp) return allowedOrigin.test(origin);
			else return !!allowedOrigin;
		}
		function configureOrigin(options, req) {
			var requestOrigin = req.headers.origin, headers = [], isAllowed;
			if (!options.origin || options.origin === "*") headers.push([{
				key: "Access-Control-Allow-Origin",
				value: "*"
			}]);
			else if (isString(options.origin)) {
				headers.push([{
					key: "Access-Control-Allow-Origin",
					value: options.origin
				}]);
				headers.push([{
					key: "Vary",
					value: "Origin"
				}]);
			} else {
				isAllowed = isOriginAllowed(requestOrigin, options.origin);
				headers.push([{
					key: "Access-Control-Allow-Origin",
					value: isAllowed ? requestOrigin : false
				}]);
				headers.push([{
					key: "Vary",
					value: "Origin"
				}]);
			}
			return headers;
		}
		function configureMethods(options) {
			var methods = options.methods;
			if (methods.join) methods = options.methods.join(",");
			return {
				key: "Access-Control-Allow-Methods",
				value: methods
			};
		}
		function configureCredentials(options) {
			if (options.credentials === true) return {
				key: "Access-Control-Allow-Credentials",
				value: "true"
			};
			return null;
		}
		function configureAllowedHeaders(options, req) {
			var allowedHeaders = options.allowedHeaders || options.headers;
			var headers = [];
			if (!allowedHeaders) {
				allowedHeaders = req.headers["access-control-request-headers"];
				headers.push([{
					key: "Vary",
					value: "Access-Control-Request-Headers"
				}]);
			} else if (allowedHeaders.join) allowedHeaders = allowedHeaders.join(",");
			if (allowedHeaders && allowedHeaders.length) headers.push([{
				key: "Access-Control-Allow-Headers",
				value: allowedHeaders
			}]);
			return headers;
		}
		function configureExposedHeaders(options) {
			var headers = options.exposedHeaders;
			if (!headers) return null;
			else if (headers.join) headers = headers.join(",");
			if (headers && headers.length) return {
				key: "Access-Control-Expose-Headers",
				value: headers
			};
			return null;
		}
		function configureMaxAge(options) {
			var maxAge = (typeof options.maxAge === "number" || options.maxAge) && options.maxAge.toString();
			if (maxAge && maxAge.length) return {
				key: "Access-Control-Max-Age",
				value: maxAge
			};
			return null;
		}
		function applyHeaders(headers, res) {
			for (var i = 0, n = headers.length; i < n; i++) {
				var header = headers[i];
				if (header) {
					if (Array.isArray(header)) applyHeaders(header, res);
					else if (header.key === "Vary" && header.value) vary(res, header.value);
					else if (header.value) res.setHeader(header.key, header.value);
				}
			}
		}
		function cors(options, req, res, next) {
			var headers = [];
			if ((req.method && req.method.toUpperCase && req.method.toUpperCase()) === "OPTIONS") {
				headers.push(configureOrigin(options, req));
				headers.push(configureCredentials(options));
				headers.push(configureMethods(options));
				headers.push(configureAllowedHeaders(options, req));
				headers.push(configureMaxAge(options));
				headers.push(configureExposedHeaders(options));
				applyHeaders(headers, res);
				if (options.preflightContinue) next();
				else {
					res.statusCode = options.optionsSuccessStatus;
					res.setHeader("Content-Length", "0");
					res.end();
				}
			} else {
				headers.push(configureOrigin(options, req));
				headers.push(configureCredentials(options));
				headers.push(configureExposedHeaders(options));
				applyHeaders(headers, res);
				next();
			}
		}
		function middlewareWrapper(o) {
			var optionsCallback = null;
			if (typeof o === "function") optionsCallback = o;
			else optionsCallback = function(req, cb) {
				cb(null, o);
			};
			return function corsMiddleware(req, res, next) {
				optionsCallback(req, function(err, options) {
					if (err) next(err);
					else {
						var corsOptions = assign({}, defaults, options);
						var originCallback = null;
						if (corsOptions.origin && typeof corsOptions.origin === "function") originCallback = corsOptions.origin;
						else if (corsOptions.origin) originCallback = function(origin, cb) {
							cb(null, corsOptions.origin);
						};
						if (originCallback) originCallback(req.headers.origin, function(err2, origin) {
							if (err2 || !origin) next(err2);
							else {
								corsOptions.origin = origin;
								cors(corsOptions, req, res, next);
							}
						});
						else next();
					}
				});
			};
		}
		module.exports = middlewareWrapper;
	})();
}));
//#endregion
//#region node_modules/engine.io/build/server.js
var require_server = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Server = exports.BaseServer = void 0;
	var base64id = require_base64id();
	var transports_1 = require_transports();
	var events_1$3 = require("events");
	var socket_1 = require_socket$1();
	var debug_1 = require_src();
	var cookie_1 = require_cookie();
	var ws_1 = require_ws();
	var webtransport_1 = require_webtransport();
	var engine_io_parser_1 = require_cjs$1();
	var debug = (0, debug_1.default)("engine");
	var kResponseHeaders = Symbol("responseHeaders");
	function parseSessionId(data) {
		try {
			const parsed = JSON.parse(data);
			if (typeof parsed.sid === "string") return parsed.sid;
		} catch (e) {}
	}
	function hasOwn(obj, key) {
		return Object.prototype.hasOwnProperty.call(obj, key);
	}
	var BaseServer = class extends events_1$3.EventEmitter {
		/**
		* Server constructor.
		*
		* @param {Object} opts - options
		*/
		constructor(opts = {}) {
			super();
			this.middlewares = [];
			this.clients = {};
			this.clientsCount = 0;
			this.opts = Object.assign({
				wsEngine: ws_1.Server,
				pingTimeout: 2e4,
				pingInterval: 25e3,
				upgradeTimeout: 1e4,
				maxHttpBufferSize: 1e6,
				transports: ["polling", "websocket"],
				allowUpgrades: true,
				httpCompression: { threshold: 1024 },
				cors: false,
				allowEIO3: false
			}, opts);
			if (opts.cookie) this.opts.cookie = Object.assign({
				name: "io",
				path: "/",
				httpOnly: true,
				sameSite: "lax"
			}, opts.cookie);
			if (this.opts.cors) this.use(require_lib()(this.opts.cors));
			if (opts.perMessageDeflate) this.opts.perMessageDeflate = Object.assign({ threshold: 1024 }, opts.perMessageDeflate);
			this.init();
		}
		/**
		* Compute the pathname of the requests that are handled by the server
		* @param options
		* @protected
		*/
		_computePath(options) {
			let path = (options.path || "/engine.io").replace(/\/$/, "");
			if (options.addTrailingSlash !== false) path += "/";
			return path;
		}
		/**
		* Returns a list of available transports for upgrade given a certain transport.
		*/
		upgrades(transport) {
			if (!this.opts.allowUpgrades) return [];
			return transports_1.default[transport].upgradesTo || [];
		}
		/**
		* Verifies a request.
		*
		* @param {EngineRequest} req
		* @param upgrade - whether it's an upgrade request
		* @param fn
		* @protected
		* @return whether the request is valid
		*/
		verify(req, upgrade, fn) {
			const transport = req._query.transport;
			if (!~this.opts.transports.indexOf(transport) || transport === "webtransport") {
				debug("unknown transport \"%s\"", transport);
				return fn(Server.errors.UNKNOWN_TRANSPORT, { transport });
			}
			if (checkInvalidHeaderChar(req.headers.origin)) {
				const origin = req.headers.origin;
				req.headers.origin = null;
				debug("origin header invalid");
				return fn(Server.errors.BAD_REQUEST, {
					name: "INVALID_ORIGIN",
					origin
				});
			}
			const sid = req._query.sid;
			if (sid) {
				if (!hasOwn(this.clients, sid)) {
					debug("unknown sid \"%s\"", sid);
					return fn(Server.errors.UNKNOWN_SID, { sid });
				}
				const previousTransport = this.clients[sid].transport.name;
				if (!upgrade && previousTransport !== transport) {
					debug("bad request: unexpected transport without upgrade");
					return fn(Server.errors.BAD_REQUEST, {
						name: "TRANSPORT_MISMATCH",
						transport,
						previousTransport
					});
				}
			} else {
				if ("GET" !== req.method) return fn(Server.errors.BAD_HANDSHAKE_METHOD, { method: req.method });
				if (transport === "websocket" && !upgrade) {
					debug("invalid transport upgrade");
					return fn(Server.errors.BAD_REQUEST, { name: "TRANSPORT_HANDSHAKE_ERROR" });
				}
				if (!this.opts.allowRequest) return fn();
				return this.opts.allowRequest(req, (message, success) => {
					if (!success) return fn(Server.errors.FORBIDDEN, { message });
					fn();
				});
			}
			fn();
		}
		/**
		* Adds a new middleware.
		*
		* @example
		* import helmet from "helmet";
		*
		* engine.use(helmet());
		*
		* @param fn
		*/
		use(fn) {
			this.middlewares.push(fn);
		}
		/**
		* Apply the middlewares to the request.
		*
		* @param req
		* @param res
		* @param callback
		* @protected
		*/
		_applyMiddlewares(req, res, callback) {
			if (this.middlewares.length === 0) {
				debug("no middleware to apply, skipping");
				return callback();
			}
			const apply = (i) => {
				debug("applying middleware n°%d", i + 1);
				this.middlewares[i](req, res, (err) => {
					if (err) return callback(err);
					if (i + 1 < this.middlewares.length) apply(i + 1);
					else callback();
				});
			};
			apply(0);
		}
		/**
		* Closes all clients.
		*/
		close() {
			debug("closing all open clients");
			for (const sid in this.clients) if (hasOwn(this.clients, sid)) this.clients[sid].close(true);
			this.cleanup();
			return this;
		}
		/**
		* generate a socket id.
		* Overwrite this method to generate your custom socket id
		*
		* @param {IncomingMessage} req - the request object
		*/
		generateId(req) {
			return base64id.generateId();
		}
		/**
		* Handshakes a new client.
		*
		* @param {String} transportName
		* @param {Object} req - the request object
		* @param {Function} closeConnection
		*
		* @protected
		*/
		async handshake(transportName, req, closeConnection) {
			const protocol = req._query.EIO === "4" ? 4 : 3;
			if (protocol === 3 && !this.opts.allowEIO3) {
				debug("unsupported protocol version");
				this.emit("connection_error", {
					req,
					code: Server.errors.UNSUPPORTED_PROTOCOL_VERSION,
					message: Server.errorMessages[Server.errors.UNSUPPORTED_PROTOCOL_VERSION],
					context: { protocol }
				});
				closeConnection(Server.errors.UNSUPPORTED_PROTOCOL_VERSION);
				return;
			}
			let id;
			try {
				id = await this.generateId(req);
			} catch (e) {
				debug("error while generating an id");
				this.emit("connection_error", {
					req,
					code: Server.errors.BAD_REQUEST,
					message: Server.errorMessages[Server.errors.BAD_REQUEST],
					context: {
						name: "ID_GENERATION_ERROR",
						error: e
					}
				});
				closeConnection(Server.errors.BAD_REQUEST);
				return;
			}
			debug("handshaking client \"%s\"", id);
			try {
				var transport = this.createTransport(transportName, req);
				if ("polling" === transportName) {
					transport.maxHttpBufferSize = this.opts.maxHttpBufferSize;
					transport.httpCompression = this.opts.httpCompression;
				} else if ("websocket" === transportName) transport.perMessageDeflate = this.opts.perMessageDeflate;
			} catch (e) {
				debug("error handshaking to transport \"%s\"", transportName);
				this.emit("connection_error", {
					req,
					code: Server.errors.BAD_REQUEST,
					message: Server.errorMessages[Server.errors.BAD_REQUEST],
					context: {
						name: "TRANSPORT_HANDSHAKE_ERROR",
						error: e
					}
				});
				closeConnection(Server.errors.BAD_REQUEST);
				return;
			}
			const socket = new socket_1.Socket(id, this, transport, req, protocol);
			transport.on("headers", (headers, req) => {
				if (!req._query.sid) {
					if (this.opts.cookie) headers["Set-Cookie"] = [(0, cookie_1.serialize)(this.opts.cookie.name, id, this.opts.cookie)];
					this.emit("initial_headers", headers, req);
				}
				this.emit("headers", headers, req);
			});
			transport.onRequest(req);
			this.clients[id] = socket;
			this.clientsCount++;
			socket.once("close", () => {
				delete this.clients[id];
				this.clientsCount--;
			});
			this.emit("connection", socket);
			return transport;
		}
		async onWebTransportSession(session) {
			if (this.middlewares.length > 0) {
				debug("closing session since WebTransport is not compatible with middlewares");
				return session.close();
			}
			const timeout = setTimeout(() => {
				debug("the client failed to establish a bidirectional stream in the given period");
				session.close();
			}, this.opts.upgradeTimeout);
			const result = await session.incomingBidirectionalStreams.getReader().read();
			if (result.done) {
				clearTimeout(timeout);
				debug("session is closed");
				return;
			}
			const stream = result.value;
			const transformStream = (0, engine_io_parser_1.createPacketDecoderStream)(this.opts.maxHttpBufferSize, "nodebuffer");
			const reader = stream.readable.pipeThrough(transformStream).getReader();
			const closeSession = async () => {
				try {
					await reader.cancel();
				} catch (e) {
					debug("error while canceling WebTransport stream reader: %s", e.message);
				}
				reader.releaseLock();
				session.close();
			};
			const { value, done } = await reader.read();
			clearTimeout(timeout);
			if (done) {
				debug("stream is closed");
				reader.releaseLock();
				return;
			}
			if (value.type !== "open") {
				debug("invalid WebTransport handshake");
				return closeSession();
			}
			if (value.data === void 0) {
				const transport = new webtransport_1.WebTransport(session, stream, reader);
				const id = base64id.generateId();
				debug("handshaking client \"%s\" (WebTransport)", id);
				const socket = new socket_1.Socket(id, this, transport, null, 4);
				this.clients[id] = socket;
				this.clientsCount++;
				socket.once("close", () => {
					delete this.clients[id];
					this.clientsCount--;
				});
				this.emit("connection", socket);
				return;
			}
			const sid = parseSessionId(value.data);
			if (!sid || !hasOwn(this.clients, sid)) {
				debug("invalid WebTransport handshake");
				return closeSession();
			}
			const client = this.clients[sid];
			if (!client) {
				debug("upgrade attempt for closed client");
				return closeSession();
			} else if (client.upgrading) {
				debug("transport has already been trying to upgrade");
				return closeSession();
			} else if (client.upgraded) {
				debug("transport had already been upgraded");
				return closeSession();
			} else {
				debug("upgrading existing transport");
				const transport = new webtransport_1.WebTransport(session, stream, reader);
				client._maybeUpgrade(transport);
			}
		}
	};
	exports.BaseServer = BaseServer;
	/**
	* Protocol errors mappings.
	*/
	BaseServer.errors = {
		UNKNOWN_TRANSPORT: 0,
		UNKNOWN_SID: 1,
		BAD_HANDSHAKE_METHOD: 2,
		BAD_REQUEST: 3,
		FORBIDDEN: 4,
		UNSUPPORTED_PROTOCOL_VERSION: 5
	};
	BaseServer.errorMessages = {
		0: "Transport unknown",
		1: "Session ID unknown",
		2: "Bad handshake method",
		3: "Bad request",
		4: "Forbidden",
		5: "Unsupported protocol version"
	};
	/**
	* Exposes a subset of the http.ServerResponse interface, in order to be able to apply the middlewares to an upgrade
	* request.
	*
	* @see https://nodejs.org/api/http.html#class-httpserverresponse
	*/
	var WebSocketResponse = class {
		constructor(req, socket) {
			this.req = req;
			this.socket = socket;
			req[kResponseHeaders] = {};
		}
		setHeader(name, value) {
			this.req[kResponseHeaders][name] = value;
		}
		getHeader(name) {
			return this.req[kResponseHeaders][name];
		}
		removeHeader(name) {
			delete this.req[kResponseHeaders][name];
		}
		write() {}
		writeHead() {}
		end() {
			this.socket.destroy();
		}
	};
	/**
	* An Engine.IO server based on Node.js built-in HTTP server and the `ws` package for WebSocket connections.
	*/
	var Server = class Server extends BaseServer {
		/**
		* Initialize websocket server
		*
		* @protected
		*/
		init() {
			if (!~this.opts.transports.indexOf("websocket")) return;
			if (this.ws) this.ws.close();
			this.ws = new this.opts.wsEngine({
				noServer: true,
				clientTracking: false,
				perMessageDeflate: this.opts.perMessageDeflate,
				maxPayload: this.opts.maxHttpBufferSize
			});
			if (typeof this.ws.on === "function") this.ws.on("headers", (headersArray, req) => {
				const additionalHeaders = req[kResponseHeaders] || {};
				delete req[kResponseHeaders];
				if (!req._query.sid) this.emit("initial_headers", additionalHeaders, req);
				this.emit("headers", additionalHeaders, req);
				debug("writing headers: %j", additionalHeaders);
				Object.keys(additionalHeaders).forEach((key) => {
					headersArray.push(`${key}: ${additionalHeaders[key]}`);
				});
			});
		}
		cleanup() {
			if (this.ws) {
				debug("closing webSocketServer");
				this.ws.close();
			}
		}
		/**
		* Prepares a request by processing the query string.
		*
		* @private
		*/
		prepare(req) {
			if (!req._query) {
				const url = new URL(req.url, "https://socket.io");
				req._query = Object.fromEntries(url.searchParams.entries());
			}
		}
		createTransport(transportName, req) {
			return new transports_1.default[transportName](req);
		}
		/**
		* Handles an Engine.IO HTTP request.
		*
		* @param {IncomingMessage} req
		* @param {ServerResponse} res
		*/
		handleRequest(req, res) {
			debug("handling \"%s\" http request \"%s\"", req.method, req.url);
			const engineRequest = req;
			this.prepare(engineRequest);
			engineRequest.res = res;
			const callback = (errorCode, errorContext) => {
				if (errorCode !== void 0) {
					this.emit("connection_error", {
						req: engineRequest,
						code: errorCode,
						message: Server.errorMessages[errorCode],
						context: errorContext
					});
					abortRequest(res, errorCode, errorContext);
					return;
				}
				if (engineRequest._query.sid) {
					debug("setting new request for existing client");
					this.clients[engineRequest._query.sid].transport.onRequest(engineRequest);
				} else {
					const closeConnection = (errorCode, errorContext) => abortRequest(res, errorCode, errorContext);
					this.handshake(engineRequest._query.transport, engineRequest, closeConnection);
				}
			};
			this._applyMiddlewares(engineRequest, res, (err) => {
				if (err) callback(Server.errors.BAD_REQUEST, { name: "MIDDLEWARE_FAILURE" });
				else this.verify(engineRequest, false, callback);
			});
		}
		/**
		* Handles an Engine.IO HTTP Upgrade.
		*/
		handleUpgrade(req, socket, upgradeHead) {
			const engineRequest = req;
			this.prepare(engineRequest);
			const res = new WebSocketResponse(engineRequest, socket);
			const callback = (errorCode, errorContext) => {
				if (errorCode !== void 0) {
					this.emit("connection_error", {
						req: engineRequest,
						code: errorCode,
						message: Server.errorMessages[errorCode],
						context: errorContext
					});
					abortUpgrade(socket, errorCode, errorContext);
					return;
				}
				const head = Buffer.from(upgradeHead);
				upgradeHead = null;
				res.writeHead();
				this.ws.handleUpgrade(engineRequest, socket, head, (websocket) => {
					this.onWebSocket(engineRequest, socket, websocket);
				});
			};
			this._applyMiddlewares(engineRequest, res, (err) => {
				if (err) callback(Server.errors.BAD_REQUEST, { name: "MIDDLEWARE_FAILURE" });
				else this.verify(engineRequest, true, callback);
			});
		}
		/**
		* Called upon a ws.io connection.
		* @param req
		* @param socket
		* @param websocket
		* @private
		*/
		onWebSocket(req, socket, websocket) {
			websocket.on("error", onUpgradeError);
			if (transports_1.default[req._query.transport] !== void 0 && !transports_1.default[req._query.transport].prototype.handlesUpgrades) {
				debug("transport doesnt handle upgraded requests");
				websocket.close();
				return;
			}
			const id = req._query.sid;
			req.websocket = websocket;
			if (id) {
				const client = this.clients[id];
				if (!client) {
					debug("upgrade attempt for closed client");
					websocket.close();
				} else if (client.upgrading) {
					debug("transport has already been trying to upgrade");
					websocket.close();
				} else if (client.upgraded) {
					debug("transport had already been upgraded");
					websocket.close();
				} else {
					debug("upgrading existing transport");
					websocket.removeListener("error", onUpgradeError);
					const transport = this.createTransport(req._query.transport, req);
					transport.perMessageDeflate = this.opts.perMessageDeflate;
					client._maybeUpgrade(transport);
				}
			} else {
				const closeConnection = (errorCode, errorContext) => abortUpgrade(socket, errorCode, errorContext);
				this.handshake(req._query.transport, req, closeConnection);
			}
			function onUpgradeError() {
				debug("websocket error before upgrade");
			}
		}
		/**
		* Captures upgrade requests for a http.Server.
		*
		* @param {http.Server} server
		* @param {Object} options
		*/
		attach(server, options = {}) {
			const path = this._computePath(options);
			const destroyUpgradeTimeout = options.destroyUpgradeTimeout || 1e3;
			function check(req) {
				return path === req.url.slice(0, path.length);
			}
			const listeners = server.listeners("request").slice(0);
			server.removeAllListeners("request");
			server.on("close", this.close.bind(this));
			server.on("listening", this.init.bind(this));
			server.on("request", (req, res) => {
				if (check(req)) {
					debug("intercepting request for path \"%s\"", path);
					this.handleRequest(req, res);
				} else {
					let i = 0;
					const l = listeners.length;
					for (; i < l; i++) listeners[i].call(server, req, res);
				}
			});
			if (~this.opts.transports.indexOf("websocket")) server.on("upgrade", (req, socket, head) => {
				if (check(req)) this.handleUpgrade(req, socket, head);
				else if (false !== options.destroyUpgrade) setTimeout(function() {
					if (socket.writable && socket.bytesWritten <= 0) {
						socket.on("error", (e) => {
							debug("error while destroying upgrade: %s", e.message);
						});
						return socket.end();
					}
				}, destroyUpgradeTimeout);
			});
		}
	};
	exports.Server = Server;
	/**
	* Close the HTTP long-polling request
	*
	* @param res - the response object
	* @param errorCode - the error code
	* @param errorContext - additional error context
	*
	* @private
	*/
	function abortRequest(res, errorCode, errorContext) {
		const statusCode = errorCode === Server.errors.FORBIDDEN ? 403 : 400;
		const message = errorContext && errorContext.message ? errorContext.message : Server.errorMessages[errorCode];
		res.writeHead(statusCode, { "Content-Type": "application/json" });
		res.end(JSON.stringify({
			code: errorCode,
			message
		}));
	}
	/**
	* Close the WebSocket connection
	*
	* @param {net.Socket} socket
	* @param {string} errorCode - the error code
	* @param {object} errorContext - additional error context
	*/
	function abortUpgrade(socket, errorCode, errorContext = {}) {
		socket.on("error", () => {
			debug("ignoring error from closed connection");
		});
		if (socket.writable) {
			const message = errorContext.message || Server.errorMessages[errorCode];
			const length = Buffer.byteLength(message);
			socket.write("HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-type: text/html\r\nContent-Length: " + length + "\r\n\r\n" + message);
		}
		socket.destroy();
	}
	/**
	* From https://github.com/nodejs/node/blob/v8.4.0/lib/_http_common.js#L303-L354
	*
	* True if val contains an invalid field-vchar
	*  field-value    = *( field-content / obs-fold )
	*  field-content  = field-vchar [ 1*( SP / HTAB ) field-vchar ]
	*  field-vchar    = VCHAR / obs-text
	*
	* checkInvalidHeaderChar() is currently designed to be inlinable by v8,
	* so take care when making changes to the implementation so that the source
	* code size does not exceed v8's default max_inlined_source_size setting.
	**/
	var validHdrChars = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	];
	function checkInvalidHeaderChar(val) {
		val += "";
		if (val.length < 1) return false;
		if (!validHdrChars[val.charCodeAt(0)]) {
			debug("invalid header, index 0, char \"%s\"", val.charCodeAt(0));
			return true;
		}
		if (val.length < 2) return false;
		if (!validHdrChars[val.charCodeAt(1)]) {
			debug("invalid header, index 1, char \"%s\"", val.charCodeAt(1));
			return true;
		}
		if (val.length < 3) return false;
		if (!validHdrChars[val.charCodeAt(2)]) {
			debug("invalid header, index 2, char \"%s\"", val.charCodeAt(2));
			return true;
		}
		if (val.length < 4) return false;
		if (!validHdrChars[val.charCodeAt(3)]) {
			debug("invalid header, index 3, char \"%s\"", val.charCodeAt(3));
			return true;
		}
		for (let i = 4; i < val.length; ++i) if (!validHdrChars[val.charCodeAt(i)]) {
			debug("invalid header, index \"%i\", char \"%s\"", i, val.charCodeAt(i));
			return true;
		}
		return false;
	}
}));
//#endregion
//#region node_modules/engine.io/build/transports-uws/polling.js
var require_polling = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Polling = void 0;
	var transport_1 = require_transport();
	var zlib_1$1 = require("zlib");
	var accepts = require_accepts();
	var debug = (0, require_src().default)("engine:polling");
	var compressionMethods = {
		gzip: zlib_1$1.createGzip,
		deflate: zlib_1$1.createDeflate
	};
	var Polling = class extends transport_1.Transport {
		/**
		* HTTP polling constructor.
		*/
		constructor(req) {
			super(req);
			this.closeTimeout = 3e4;
		}
		/**
		* Transport name
		*/
		get name() {
			return "polling";
		}
		/**
		* Overrides onRequest.
		*
		* @param req
		*
		* @private
		*/
		onRequest(req) {
			const res = req.res;
			req.res = null;
			if (req.getMethod() === "get") this.onPollRequest(req, res);
			else if (req.getMethod() === "post") this.onDataRequest(req, res);
			else {
				res.writeStatus("500 Internal Server Error");
				res.end();
			}
		}
		/**
		* The client sends a request awaiting for us to send data.
		*
		* @private
		*/
		onPollRequest(req, res) {
			if (this.req) {
				debug("request overlap");
				this.onError("overlap from client");
				res.writeStatus("500 Internal Server Error");
				res.end();
				return;
			}
			debug("setting request");
			this.req = req;
			this.res = res;
			const onClose = () => {
				this.writable = false;
				this.onError("poll connection closed prematurely");
			};
			const cleanup = () => {
				this.req = this.res = null;
			};
			req.cleanup = cleanup;
			res.onAborted(onClose);
			this.writable = true;
			this.emit("ready");
			if (this.writable && this.shouldClose) {
				debug("triggering empty send to append close packet");
				this.send([{ type: "noop" }]);
			}
		}
		/**
		* The client sends a request with data.
		*
		* @private
		*/
		onDataRequest(req, res) {
			if (this.dataReq) {
				this.onError("data request overlap from client");
				res.writeStatus("500 Internal Server Error");
				res.end();
				return;
			}
			const expectedContentLength = Number(req.headers["content-length"]);
			if (!expectedContentLength) {
				this.onError("content-length header required");
				res.writeStatus("411 Length Required").end();
				return;
			}
			if (expectedContentLength > this.maxHttpBufferSize) {
				this.onError("payload too large");
				res.writeStatus("413 Payload Too Large").end();
				return;
			}
			if ("application/octet-stream" === req.headers["content-type"] && this.protocol === 4) {
				this.onError("invalid content");
				return res.writeStatus("400 Bad Request").end();
			}
			this.dataReq = req;
			this.dataRes = res;
			let buffer;
			let offset = 0;
			const headers = { "Content-Type": "text/html" };
			this.headers(req, headers);
			for (let key in headers) res.writeHeader(key, String(headers[key]));
			const onEnd = (buffer) => {
				this.onData(buffer.toString());
				this.onDataRequestCleanup();
				res.cork(() => {
					res.end("ok");
				});
			};
			res.onAborted(() => {
				this.onDataRequestCleanup();
				this.onError("data request connection closed prematurely");
			});
			res.onData((arrayBuffer, isLast) => {
				const totalLength = offset + arrayBuffer.byteLength;
				if (totalLength > expectedContentLength) {
					this.onError("content-length mismatch");
					res.close();
					return;
				}
				if (!buffer) {
					if (isLast) {
						onEnd(Buffer.from(arrayBuffer));
						return;
					}
					buffer = Buffer.allocUnsafe(expectedContentLength);
				}
				Buffer.from(arrayBuffer).copy(buffer, offset);
				if (isLast) {
					if (totalLength != expectedContentLength) {
						this.onError("content-length mismatch");
						res.writeStatus("400 Content-Length Mismatch").end();
						this.onDataRequestCleanup();
						return;
					}
					onEnd(buffer);
					return;
				}
				offset = totalLength;
			});
		}
		/**
		* Cleanup request.
		*
		* @private
		*/
		onDataRequestCleanup() {
			this.dataReq = this.dataRes = null;
		}
		/**
		* Processes the incoming data payload.
		*
		* @param {String} encoded payload
		* @private
		*/
		onData(data) {
			debug("received \"%s\"", data);
			const callback = (packet) => {
				if ("close" === packet.type) {
					debug("got xhr close packet");
					this.onClose();
					return false;
				}
				this.onPacket(packet);
			};
			if (this.protocol === 3) this.parser.decodePayload(data, callback);
			else this.parser.decodePayload(data).forEach(callback);
		}
		/**
		* Overrides onClose.
		*
		* @private
		*/
		onClose() {
			if (this.writable) this.send([{ type: "noop" }]);
			super.onClose();
		}
		/**
		* Writes a packet payload.
		*
		* @param {Object} packet
		* @private
		*/
		send(packets) {
			this.writable = false;
			if (this.shouldClose) {
				debug("appending close packet to payload");
				packets.push({ type: "close" });
				this.shouldClose();
				this.shouldClose = null;
			}
			const doWrite = (data) => {
				const compress = packets.some((packet) => {
					return packet.options && packet.options.compress;
				});
				this.write(data, { compress });
			};
			if (this.protocol === 3) this.parser.encodePayload(packets, this.supportsBinary, doWrite);
			else this.parser.encodePayload(packets, doWrite);
		}
		/**
		* Writes data as response to poll request.
		*
		* @param {String} data
		* @param {Object} options
		* @private
		*/
		write(data, options) {
			debug("writing \"%s\"", data);
			this.doWrite(data, options, () => {
				this.req.cleanup();
				this.emit("drain");
			});
		}
		/**
		* Performs the write.
		*
		* @private
		*/
		doWrite(data, options, callback) {
			const isString = typeof data === "string";
			const headers = { "Content-Type": isString ? "text/plain; charset=UTF-8" : "application/octet-stream" };
			const respond = (data) => {
				this.headers(this.req, headers);
				this.res.cork(() => {
					Object.keys(headers).forEach((key) => {
						this.res.writeHeader(key, String(headers[key]));
					});
					this.res.end(data);
				});
				callback();
			};
			if (!this.httpCompression || !options.compress) {
				respond(data);
				return;
			}
			if ((isString ? Buffer.byteLength(data) : data.length) < this.httpCompression.threshold) {
				respond(data);
				return;
			}
			const encoding = accepts(this.req).encodings(["gzip", "deflate"]);
			if (!encoding) {
				respond(data);
				return;
			}
			this.compress(data, encoding, (err, data) => {
				if (err) {
					this.res.writeStatus("500 Internal Server Error");
					this.res.end();
					callback(err);
					return;
				}
				headers["Content-Encoding"] = encoding;
				respond(data);
			});
		}
		/**
		* Compresses data.
		*
		* @private
		*/
		compress(data, encoding, callback) {
			debug("compressing");
			const buffers = [];
			let nread = 0;
			compressionMethods[encoding](this.httpCompression).on("error", callback).on("data", function(chunk) {
				buffers.push(chunk);
				nread += chunk.length;
			}).on("end", function() {
				callback(null, Buffer.concat(buffers, nread));
			}).end(data);
		}
		/**
		* Closes the transport.
		*
		* @private
		*/
		doClose(fn) {
			debug("closing");
			let closeTimeoutTimer;
			const onClose = () => {
				clearTimeout(closeTimeoutTimer);
				fn();
				this.onClose();
			};
			if (this.writable) {
				debug("transport writable - closing right away");
				this.send([{ type: "close" }]);
				onClose();
			} else if (this.discarded) {
				debug("transport discarded - closing right away");
				onClose();
			} else {
				debug("transport not writable - buffering orderly close");
				this.shouldClose = onClose;
				closeTimeoutTimer = setTimeout(onClose, this.closeTimeout);
			}
		}
		/**
		* Returns headers for a response.
		*
		* @param req - request
		* @param {Object} extra headers
		* @private
		*/
		headers(req, headers) {
			headers = headers || {};
			const ua = req.headers["user-agent"];
			if (ua && (~ua.indexOf(";MSIE") || ~ua.indexOf("Trident/"))) headers["X-XSS-Protection"] = "0";
			headers["cache-control"] = "no-store";
			this.emit("headers", headers, req);
			return headers;
		}
	};
	exports.Polling = Polling;
}));
//#endregion
//#region node_modules/engine.io/build/transports-uws/websocket.js
var require_websocket = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WebSocket = void 0;
	var transport_1 = require_transport();
	var debug = (0, require_src().default)("engine:ws");
	var WebSocket = class extends transport_1.Transport {
		/**
		* WebSocket transport
		*
		* @param req
		*/
		constructor(req) {
			super(req);
			this.writable = false;
			this.perMessageDeflate = null;
		}
		/**
		* Transport name
		*/
		get name() {
			return "websocket";
		}
		/**
		* Advertise upgrade support.
		*/
		get handlesUpgrades() {
			return true;
		}
		/**
		* Writes a packet payload.
		*
		* @param {Array} packets
		* @private
		*/
		send(packets) {
			this.writable = false;
			for (let i = 0; i < packets.length; i++) {
				const packet = packets[i];
				const isLast = i + 1 === packets.length;
				const send = (data) => {
					const isBinary = typeof data !== "string";
					const compress = this.perMessageDeflate && Buffer.byteLength(data) > this.perMessageDeflate.threshold;
					debug("writing \"%s\"", data);
					this.socket.send(data, isBinary, compress);
					if (isLast) {
						this.emit("drain");
						this.writable = true;
						this.emit("ready");
					}
				};
				if (packet.options && typeof packet.options.wsPreEncoded === "string") send(packet.options.wsPreEncoded);
				else this.parser.encodePacket(packet, this.supportsBinary, send);
			}
		}
		/**
		* Closes the transport.
		*
		* @private
		*/
		doClose(fn) {
			debug("closing");
			fn && fn();
			this.socket.end();
		}
	};
	exports.WebSocket = WebSocket;
}));
//#endregion
//#region node_modules/engine.io/build/transports-uws/index.js
var require_transports_uws = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var polling_1 = require_polling();
	var websocket_1 = require_websocket();
	exports.default = {
		polling: polling_1.Polling,
		websocket: websocket_1.WebSocket
	};
}));
//#endregion
//#region node_modules/engine.io/build/userver.js
var require_userver = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.uServer = void 0;
	var debug_1 = require_src();
	var server_1 = require_server();
	var transports_uws_1 = require_transports_uws();
	var debug = (0, debug_1.default)("engine:uws");
	/**
	* An Engine.IO server based on the `uWebSockets.js` package.
	*/
	var uServer = class extends server_1.BaseServer {
		init() {}
		cleanup() {}
		/**
		* Prepares a request by processing the query string.
		*
		* @private
		*/
		prepare(req, res) {
			req.method = req.getMethod().toUpperCase();
			req.url = req.getUrl();
			const params = new URLSearchParams(req.getQuery());
			req._query = Object.fromEntries(params.entries());
			req.headers = {};
			req.forEach((key, value) => {
				req.headers[key] = value;
			});
			req.connection = { remoteAddress: Buffer.from(res.getRemoteAddressAsText()).toString() };
			res.onAborted(() => {
				debug("response has been aborted");
			});
		}
		createTransport(transportName, req) {
			return new transports_uws_1.default[transportName](req);
		}
		/**
		* Attach the engine to a µWebSockets.js server
		* @param app
		* @param options
		*/
		attach(app, options = {}) {
			const path = this._computePath(options);
			app.any(path, this.handleRequest.bind(this)).ws(path, {
				compression: options.compression,
				idleTimeout: options.idleTimeout,
				maxBackpressure: options.maxBackpressure,
				maxPayloadLength: this.opts.maxHttpBufferSize,
				upgrade: this.handleUpgrade.bind(this),
				open: (ws) => {
					const transport = ws.getUserData().transport;
					transport.socket = ws;
					transport.writable = true;
					transport.emit("ready");
				},
				message: (ws, message, isBinary) => {
					ws.getUserData().transport.onData(isBinary ? message : Buffer.from(message).toString());
				},
				close: (ws, code, message) => {
					ws.getUserData().transport.onClose(code, message);
				}
			});
		}
		_applyMiddlewares(req, res, callback) {
			if (this.middlewares.length === 0) return callback();
			req.res = new ResponseWrapper(res);
			super._applyMiddlewares(req, req.res, (err) => {
				req.res.writeHead();
				callback(err);
			});
		}
		handleRequest(res, req) {
			debug("handling \"%s\" http request \"%s\"", req.getMethod(), req.getUrl());
			this.prepare(req, res);
			req.res = res;
			const callback = (errorCode, errorContext) => {
				if (errorCode !== void 0) {
					this.emit("connection_error", {
						req,
						code: errorCode,
						message: server_1.Server.errorMessages[errorCode],
						context: errorContext
					});
					this.abortRequest(req.res, errorCode, errorContext);
					return;
				}
				if (req._query.sid) {
					debug("setting new request for existing client");
					this.clients[req._query.sid].transport.onRequest(req);
				} else {
					const closeConnection = (errorCode, errorContext) => this.abortRequest(res, errorCode, errorContext);
					this.handshake(req._query.transport, req, closeConnection);
				}
			};
			this._applyMiddlewares(req, res, (err) => {
				if (err) callback(server_1.Server.errors.BAD_REQUEST, { name: "MIDDLEWARE_FAILURE" });
				else this.verify(req, false, callback);
			});
		}
		handleUpgrade(res, req, context) {
			debug("on upgrade");
			this.prepare(req, res);
			req.res = res;
			const callback = async (errorCode, errorContext) => {
				if (errorCode !== void 0) {
					this.emit("connection_error", {
						req,
						code: errorCode,
						message: server_1.Server.errorMessages[errorCode],
						context: errorContext
					});
					this.abortRequest(res, errorCode, errorContext);
					return;
				}
				const id = req._query.sid;
				let transport;
				if (id) {
					const client = this.clients[id];
					if (!client) {
						debug("upgrade attempt for closed client");
						return res.close();
					} else if (client.upgrading) {
						debug("transport has already been trying to upgrade");
						return res.close();
					} else if (client.upgraded) {
						debug("transport had already been upgraded");
						return res.close();
					} else {
						debug("upgrading existing transport");
						transport = this.createTransport(req._query.transport, req);
						client._maybeUpgrade(transport);
					}
				} else {
					transport = await this.handshake(req._query.transport, req, (errorCode, errorContext) => this.abortRequest(res, errorCode, errorContext));
					if (!transport) return;
				}
				const additionalHeaders = {};
				if (!id) this.emit("initial_headers", additionalHeaders, req);
				this.emit("headers", additionalHeaders, req);
				req.res.writeStatus("101 Switching Protocols");
				Object.keys(additionalHeaders).forEach((key) => {
					req.res.writeHeader(key, additionalHeaders[key]);
				});
				res.upgrade({ transport }, req.getHeader("sec-websocket-key"), req.getHeader("sec-websocket-protocol"), req.getHeader("sec-websocket-extensions"), context);
			};
			this._applyMiddlewares(req, res, (err) => {
				if (err) callback(server_1.Server.errors.BAD_REQUEST, { name: "MIDDLEWARE_FAILURE" });
				else this.verify(req, true, callback);
			});
		}
		abortRequest(res, errorCode, errorContext) {
			const statusCode = errorCode === server_1.Server.errors.FORBIDDEN ? "403 Forbidden" : "400 Bad Request";
			const message = errorContext && errorContext.message ? errorContext.message : server_1.Server.errorMessages[errorCode];
			res.writeStatus(statusCode);
			res.writeHeader("Content-Type", "application/json");
			res.end(JSON.stringify({
				code: errorCode,
				message
			}));
		}
	};
	exports.uServer = uServer;
	var ResponseWrapper = class {
		constructor(res) {
			this.res = res;
			this.statusWritten = false;
			this.headers = [];
			this.isAborted = false;
		}
		set statusCode(status) {
			if (!status) return;
			this.writeStatus(status === 200 ? "200 OK" : "204 No Content");
		}
		writeHead(status) {
			this.statusCode = status;
		}
		setHeader(key, value) {
			if (Array.isArray(value)) value.forEach((val) => {
				this.writeHeader(key, val);
			});
			else this.writeHeader(key, value);
		}
		removeHeader() {}
		getHeader() {}
		writeStatus(status) {
			if (this.isAborted) return;
			this.res.writeStatus(status);
			this.statusWritten = true;
			this.writeBufferedHeaders();
			return this;
		}
		writeHeader(key, value) {
			if (this.isAborted) return;
			if (key === "Content-Length") return;
			if (this.statusWritten) this.res.writeHeader(key, value);
			else this.headers.push([key, value]);
		}
		writeBufferedHeaders() {
			this.headers.forEach(([key, value]) => {
				this.res.writeHeader(key, value);
			});
		}
		end(data) {
			if (this.isAborted) return;
			this.res.cork(() => {
				if (!this.statusWritten) this.writeBufferedHeaders();
				this.res.end(data);
			});
		}
		onData(fn) {
			if (this.isAborted) return;
			this.res.onData(fn);
		}
		onAborted(fn) {
			if (this.isAborted) return;
			this.res.onAborted(() => {
				this.isAborted = true;
				fn();
			});
		}
		cork(fn) {
			if (this.isAborted) return;
			this.res.cork(fn);
		}
	};
}));
//#endregion
//#region node_modules/engine.io/build/engine.io.js
var require_engine_io = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.protocol = exports.Transport = exports.Socket = exports.uServer = exports.parser = exports.transports = exports.Server = void 0;
	exports.listen = listen;
	exports.attach = attach;
	var http_1$1 = require("http");
	var server_1 = require_server();
	Object.defineProperty(exports, "Server", {
		enumerable: true,
		get: function() {
			return server_1.Server;
		}
	});
	exports.transports = require_transports().default;
	var parser = require_cjs$1();
	exports.parser = parser;
	var userver_1 = require_userver();
	Object.defineProperty(exports, "uServer", {
		enumerable: true,
		get: function() {
			return userver_1.uServer;
		}
	});
	var socket_1 = require_socket$1();
	Object.defineProperty(exports, "Socket", {
		enumerable: true,
		get: function() {
			return socket_1.Socket;
		}
	});
	var transport_1 = require_transport();
	Object.defineProperty(exports, "Transport", {
		enumerable: true,
		get: function() {
			return transport_1.Transport;
		}
	});
	exports.protocol = parser.protocol;
	/**
	* Creates an http.Server exclusively used for WS upgrades, and starts listening.
	*
	* @param port
	* @param options
	* @param listenCallback - callback for http.Server.listen()
	* @return engine.io server
	*/
	function listen(port, options, listenCallback) {
		if ("function" === typeof options) {
			listenCallback = options;
			options = {};
		}
		const server = (0, http_1$1.createServer)(function(req, res) {
			res.writeHead(501);
			res.end("Not Implemented");
		});
		const engine = attach(server, options);
		engine.httpServer = server;
		server.listen(port, listenCallback);
		return engine;
	}
	/**
	* Captures upgrade requests for a http.Server.
	*
	* @param server
	* @param options
	* @return engine.io server
	*/
	function attach(server, options) {
		const engine = new server_1.Server(options);
		engine.attach(server, options);
		return engine;
	}
}));
//#endregion
//#region node_modules/@socket.io/component-emitter/lib/esm/index.js
var esm_exports = /* @__PURE__ */ __exportAll({ Emitter: () => Emitter });
/**
* Initialize a new `Emitter`.
*
* @api public
*/
function Emitter(obj) {
	if (obj) return mixin(obj);
}
/**
* Mixin the emitter properties.
*
* @param {Object} obj
* @return {Object}
* @api private
*/
function mixin(obj) {
	for (var key in Emitter.prototype) obj[key] = Emitter.prototype[key];
	return obj;
}
var init_esm = __esmMin((() => {
	/**
	* Listen on the given `event` with `fn`.
	*
	* @param {String} event
	* @param {Function} fn
	* @return {Emitter}
	* @api public
	*/
	Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
		this._callbacks = this._callbacks || {};
		(this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
		return this;
	};
	/**
	* Adds an `event` listener that will be invoked a single
	* time then automatically removed.
	*
	* @param {String} event
	* @param {Function} fn
	* @return {Emitter}
	* @api public
	*/
	Emitter.prototype.once = function(event, fn) {
		function on() {
			this.off(event, on);
			fn.apply(this, arguments);
		}
		on.fn = fn;
		this.on(event, on);
		return this;
	};
	/**
	* Remove the given callback for `event` or all
	* registered callbacks.
	*
	* @param {String} event
	* @param {Function} fn
	* @return {Emitter}
	* @api public
	*/
	Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
		this._callbacks = this._callbacks || {};
		if (0 == arguments.length) {
			this._callbacks = {};
			return this;
		}
		var callbacks = this._callbacks["$" + event];
		if (!callbacks) return this;
		if (1 == arguments.length) {
			delete this._callbacks["$" + event];
			return this;
		}
		var cb;
		for (var i = 0; i < callbacks.length; i++) {
			cb = callbacks[i];
			if (cb === fn || cb.fn === fn) {
				callbacks.splice(i, 1);
				break;
			}
		}
		if (callbacks.length === 0) delete this._callbacks["$" + event];
		return this;
	};
	/**
	* Emit `event` with the given args.
	*
	* @param {String} event
	* @param {Mixed} ...
	* @return {Emitter}
	*/
	Emitter.prototype.emit = function(event) {
		this._callbacks = this._callbacks || {};
		var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event];
		for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
		if (callbacks) {
			callbacks = callbacks.slice(0);
			for (var i = 0, len = callbacks.length; i < len; ++i) callbacks[i].apply(this, args);
		}
		return this;
	};
	Emitter.prototype.emitReserved = Emitter.prototype.emit;
	/**
	* Return array of callbacks for `event`.
	*
	* @param {String} event
	* @return {Array}
	* @api public
	*/
	Emitter.prototype.listeners = function(event) {
		this._callbacks = this._callbacks || {};
		return this._callbacks["$" + event] || [];
	};
	/**
	* Check if this emitter has `event` handlers.
	*
	* @param {String} event
	* @return {Boolean}
	* @api public
	*/
	Emitter.prototype.hasListeners = function(event) {
		return !!this.listeners(event).length;
	};
}));
//#endregion
//#region node_modules/socket.io-parser/build/cjs/is-binary.js
var require_is_binary = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isBinary = isBinary;
	exports.hasBinary = hasBinary;
	var withNativeArrayBuffer = typeof ArrayBuffer === "function";
	var isView = (obj) => {
		return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
	};
	var toString = Object.prototype.toString;
	var withNativeBlob = typeof Blob === "function" || typeof Blob !== "undefined" && toString.call(Blob) === "[object BlobConstructor]";
	var withNativeFile = typeof File === "function" || typeof File !== "undefined" && toString.call(File) === "[object FileConstructor]";
	/**
	* Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
	*
	* @private
	*/
	function isBinary(obj) {
		return withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj)) || withNativeBlob && obj instanceof Blob || withNativeFile && obj instanceof File;
	}
	function hasBinary(obj, toJSON) {
		if (!obj || typeof obj !== "object") return false;
		if (Array.isArray(obj)) {
			for (let i = 0, l = obj.length; i < l; i++) if (hasBinary(obj[i])) return true;
			return false;
		}
		if (isBinary(obj)) return true;
		if (obj.toJSON && typeof obj.toJSON === "function" && arguments.length === 1) return hasBinary(obj.toJSON(), true);
		for (const key in obj) if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) return true;
		return false;
	}
}));
//#endregion
//#region node_modules/socket.io-parser/build/cjs/binary.js
var require_binary = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.deconstructPacket = deconstructPacket;
	exports.reconstructPacket = reconstructPacket;
	var is_binary_js_1 = require_is_binary();
	/**
	* Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
	*
	* @param {Object} packet - socket.io event packet
	* @return {Object} with deconstructed packet and list of buffers
	* @public
	*/
	function deconstructPacket(packet) {
		const buffers = [];
		const packetData = packet.data;
		const pack = packet;
		pack.data = _deconstructPacket(packetData, buffers);
		pack.attachments = buffers.length;
		return {
			packet: pack,
			buffers
		};
	}
	function _deconstructPacket(data, buffers, toJSON) {
		if (!data) return data;
		if ((0, is_binary_js_1.isBinary)(data)) {
			const placeholder = {
				_placeholder: true,
				num: buffers.length
			};
			buffers.push(data);
			return placeholder;
		} else if (Array.isArray(data)) {
			const newData = new Array(data.length);
			for (let i = 0; i < data.length; i++) newData[i] = _deconstructPacket(data[i], buffers);
			return newData;
		} else if (typeof data === "object" && !(data instanceof Date)) {
			if (data.toJSON && typeof data.toJSON === "function" && !toJSON) return _deconstructPacket(data.toJSON(), buffers, true);
			const newData = {};
			for (const key in data) if (Object.prototype.hasOwnProperty.call(data, key)) newData[key] = _deconstructPacket(data[key], buffers);
			return newData;
		}
		return data;
	}
	/**
	* Reconstructs a binary packet from its placeholder packet and buffers
	*
	* @param {Object} packet - event packet with placeholders
	* @param {Array} buffers - binary buffers to put in placeholder positions
	* @return {Object} reconstructed packet
	* @public
	*/
	function reconstructPacket(packet, buffers) {
		packet.data = _reconstructPacket(packet.data, buffers);
		delete packet.attachments;
		return packet;
	}
	function _reconstructPacket(data, buffers) {
		if (!data) return data;
		if (data && data._placeholder === true) {
			if (typeof data.num === "number" && data.num >= 0 && data.num < buffers.length) return buffers[data.num];
			else throw new Error("illegal attachments");
		} else if (Array.isArray(data)) for (let i = 0; i < data.length; i++) data[i] = _reconstructPacket(data[i], buffers);
		else if (typeof data === "object") {
			for (const key in data) if (Object.prototype.hasOwnProperty.call(data, key)) data[key] = _reconstructPacket(data[key], buffers);
		}
		return data;
	}
}));
//#endregion
//#region node_modules/socket.io-parser/build/cjs/index.js
var require_cjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Decoder = exports.Encoder = exports.PacketType = exports.protocol = void 0;
	exports.isPacketValid = isPacketValid;
	var component_emitter_1 = (init_esm(), __toCommonJS(esm_exports));
	var binary_js_1 = require_binary();
	var is_binary_js_1 = require_is_binary();
	var debug = (0, __importDefault(require_src()).default)("socket.io-parser");
	/**
	* These strings must not be used as event names, as they have a special meaning.
	*/
	var RESERVED_EVENTS = [
		"connect",
		"connect_error",
		"disconnect",
		"disconnecting",
		"newListener",
		"removeListener"
	];
	/**
	* Protocol version.
	*
	* @public
	*/
	exports.protocol = 5;
	var PacketType;
	(function(PacketType) {
		PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
		PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
		PacketType[PacketType["EVENT"] = 2] = "EVENT";
		PacketType[PacketType["ACK"] = 3] = "ACK";
		PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
		PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
		PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
	})(PacketType || (exports.PacketType = PacketType = {}));
	/**
	* A socket.io Encoder instance
	*/
	var Encoder = class {
		/**
		* Encoder constructor
		*
		* @param {function} replacer - custom replacer to pass down to JSON.parse
		*/
		constructor(replacer) {
			this.replacer = replacer;
		}
		/**
		* Encode a packet as a single string if non-binary, or as a
		* buffer sequence, depending on packet type.
		*
		* @param {Object} obj - packet object
		*/
		encode(obj) {
			debug("encoding packet %j", obj);
			if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
				if ((0, is_binary_js_1.hasBinary)(obj)) return this.encodeAsBinary({
					type: obj.type === PacketType.EVENT ? PacketType.BINARY_EVENT : PacketType.BINARY_ACK,
					nsp: obj.nsp,
					data: obj.data,
					id: obj.id
				});
			}
			return [this.encodeAsString(obj)];
		}
		/**
		* Encode packet as string.
		*/
		encodeAsString(obj) {
			let str = "" + obj.type;
			if (obj.type === PacketType.BINARY_EVENT || obj.type === PacketType.BINARY_ACK) str += obj.attachments + "-";
			if (obj.nsp && "/" !== obj.nsp) str += obj.nsp + ",";
			if (null != obj.id) str += obj.id;
			if (null != obj.data) str += JSON.stringify(obj.data, this.replacer);
			debug("encoded %j as %s", obj, str);
			return str;
		}
		/**
		* Encode packet as 'buffer sequence' by removing blobs, and
		* deconstructing packet into object with placeholders and
		* a list of buffers.
		*/
		encodeAsBinary(obj) {
			const deconstruction = (0, binary_js_1.deconstructPacket)(obj);
			const pack = this.encodeAsString(deconstruction.packet);
			const buffers = deconstruction.buffers;
			buffers.unshift(pack);
			return buffers;
		}
	};
	exports.Encoder = Encoder;
	exports.Decoder = class Decoder extends component_emitter_1.Emitter {
		/**
		* Decoder constructor
		*/
		constructor(opts) {
			super();
			this.opts = Object.assign({
				reviver: void 0,
				maxAttachments: 10
			}, typeof opts === "function" ? { reviver: opts } : opts);
		}
		/**
		* Decodes an encoded packet string into packet JSON.
		*
		* @param {String} obj - encoded packet
		*/
		add(obj) {
			let packet;
			if (typeof obj === "string") {
				if (this.reconstructor) throw new Error("got plaintext data when reconstructing a packet");
				packet = this.decodeString(obj);
				const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
				if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
					packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
					this.reconstructor = new BinaryReconstructor(packet);
				} else super.emitReserved("decoded", packet);
			} else if ((0, is_binary_js_1.isBinary)(obj) || obj.base64) {
				if (!this.reconstructor) throw new Error("got binary data when not reconstructing a packet");
				else {
					packet = this.reconstructor.takeBinaryData(obj);
					if (packet) {
						this.reconstructor = null;
						super.emitReserved("decoded", packet);
					}
				}
			} else throw new Error("Unknown type: " + obj);
		}
		/**
		* Decode a packet String (JSON data)
		*
		* @param {String} str
		* @return {Object} packet
		*/
		decodeString(str) {
			let i = 0;
			const p = { type: Number(str.charAt(0)) };
			if (PacketType[p.type] === void 0) throw new Error("unknown packet type " + p.type);
			if (p.type === PacketType.BINARY_EVENT || p.type === PacketType.BINARY_ACK) {
				const start = i + 1;
				while (str.charAt(++i) !== "-" && i != str.length);
				const buf = str.substring(start, i);
				if (buf != Number(buf) || str.charAt(i) !== "-") throw new Error("Illegal attachments");
				const n = Number(buf);
				if (!isInteger(n) || n < 1) throw new Error("Illegal attachments");
				else if (n > this.opts.maxAttachments) throw new Error("too many attachments");
				p.attachments = n;
			}
			if ("/" === str.charAt(i + 1)) {
				const start = i + 1;
				while (++i) {
					if ("," === str.charAt(i)) break;
					if (i === str.length) break;
				}
				p.nsp = str.substring(start, i);
			} else p.nsp = "/";
			const next = str.charAt(i + 1);
			if ("" !== next && Number(next) == next) {
				const start = i + 1;
				while (++i) {
					const c = str.charAt(i);
					if (null == c || Number(c) != c) {
						--i;
						break;
					}
					if (i === str.length) break;
				}
				p.id = Number(str.substring(start, i + 1));
			}
			if (str.charAt(++i)) {
				const payload = this.tryParse(str.substr(i));
				if (Decoder.isPayloadValid(p.type, payload)) p.data = payload;
				else throw new Error("invalid payload");
			}
			debug("decoded %s as %j", str, p);
			return p;
		}
		tryParse(str) {
			try {
				return JSON.parse(str, this.opts.reviver);
			} catch (e) {
				return false;
			}
		}
		static isPayloadValid(type, payload) {
			switch (type) {
				case PacketType.CONNECT: return isObject(payload);
				case PacketType.DISCONNECT: return payload === void 0;
				case PacketType.CONNECT_ERROR: return typeof payload === "string" || isObject(payload);
				case PacketType.EVENT:
				case PacketType.BINARY_EVENT: return Array.isArray(payload) && (typeof payload[0] === "number" || typeof payload[0] === "string" && RESERVED_EVENTS.indexOf(payload[0]) === -1);
				case PacketType.ACK:
				case PacketType.BINARY_ACK: return Array.isArray(payload);
			}
		}
		/**
		* Deallocates a parser's resources
		*/
		destroy() {
			if (this.reconstructor) {
				this.reconstructor.finishedReconstruction();
				this.reconstructor = null;
			}
		}
	};
	/**
	* A manager of a binary event's 'buffer sequence'. Should
	* be constructed whenever a packet of type BINARY_EVENT is
	* decoded.
	*
	* @param {Object} packet
	* @return {BinaryReconstructor} initialized reconstructor
	*/
	var BinaryReconstructor = class {
		constructor(packet) {
			this.packet = packet;
			this.buffers = [];
			this.reconPack = packet;
		}
		/**
		* Method to be called when binary data received from connection
		* after a BINARY_EVENT packet.
		*
		* @param {Buffer | ArrayBuffer} binData - the raw binary data received
		* @return {null | Object} returns null if more binary data is expected or
		*   a reconstructed packet object if all buffers have been received.
		*/
		takeBinaryData(binData) {
			this.buffers.push(binData);
			if (this.buffers.length === this.reconPack.attachments) {
				const packet = (0, binary_js_1.reconstructPacket)(this.reconPack, this.buffers);
				this.finishedReconstruction();
				return packet;
			}
			return null;
		}
		/**
		* Cleans up binary packet reconstruction variables.
		*/
		finishedReconstruction() {
			this.reconPack = null;
			this.buffers = [];
		}
	};
	function isNamespaceValid(nsp) {
		return typeof nsp === "string";
	}
	var isInteger = Number.isInteger || function(value) {
		return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
	};
	function isAckIdValid(id) {
		return id === void 0 || isInteger(id);
	}
	function isObject(value) {
		return Object.prototype.toString.call(value) === "[object Object]";
	}
	function isDataValid(type, payload) {
		switch (type) {
			case PacketType.CONNECT: return payload === void 0 || isObject(payload);
			case PacketType.DISCONNECT: return payload === void 0;
			case PacketType.EVENT: return Array.isArray(payload) && (typeof payload[0] === "number" || typeof payload[0] === "string" && RESERVED_EVENTS.indexOf(payload[0]) === -1);
			case PacketType.ACK: return Array.isArray(payload);
			case PacketType.CONNECT_ERROR: return typeof payload === "string" || isObject(payload);
			default: return false;
		}
	}
	function isPacketValid(packet) {
		return isNamespaceValid(packet.nsp) && isAckIdValid(packet.id) && isDataValid(packet.type, packet.data);
	}
}));
//#endregion
//#region node_modules/socket.io/dist/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Client = void 0;
	var socket_io_parser_1 = require_cjs();
	var debug = (0, __importDefault(require_src()).default)("socket.io:client");
	var Client = class {
		/**
		* Client constructor.
		*
		* @param server instance
		* @param conn
		* @package
		*/
		constructor(server, conn) {
			this.sockets = /* @__PURE__ */ new Map();
			this.nsps = /* @__PURE__ */ new Map();
			this.server = server;
			this.conn = conn;
			this.encoder = server.encoder;
			this.decoder = new server._parser.Decoder();
			this.id = conn.id;
			this.setup();
		}
		/**
		* @return the reference to the request that originated the Engine.IO connection
		*
		* @public
		*/
		get request() {
			return this.conn.request;
		}
		/**
		* Sets up event listeners.
		*
		* @private
		*/
		setup() {
			this.onclose = this.onclose.bind(this);
			this.ondata = this.ondata.bind(this);
			this.onerror = this.onerror.bind(this);
			this.ondecoded = this.ondecoded.bind(this);
			this.decoder.on("decoded", this.ondecoded);
			this.conn.on("data", this.ondata);
			this.conn.on("error", this.onerror);
			this.conn.on("close", this.onclose);
			this.connectTimeout = setTimeout(() => {
				if (this.nsps.size === 0) {
					debug("no namespace joined yet, close the client");
					this.close();
				} else debug("the client has already joined a namespace, nothing to do");
			}, this.server._connectTimeout);
		}
		/**
		* Connects a client to a namespace.
		*
		* @param {String} name - the namespace
		* @param {Object} auth - the auth parameters
		* @private
		*/
		connect(name, auth = {}) {
			if (this.server._nsps.has(name)) {
				debug("connecting to namespace %s", name);
				return this.doConnect(name, auth);
			}
			this.server._checkNamespace(name, auth, (dynamicNspName) => {
				if (dynamicNspName) this.doConnect(name, auth);
				else {
					debug("creation of namespace %s was denied", name);
					this._packet({
						type: socket_io_parser_1.PacketType.CONNECT_ERROR,
						nsp: name,
						data: { message: "Invalid namespace" }
					});
				}
			});
		}
		/**
		* Connects a client to a namespace.
		*
		* @param name - the namespace
		* @param {Object} auth - the auth parameters
		*
		* @private
		*/
		doConnect(name, auth) {
			const nsp = this.server.of(name);
			nsp._add(this, auth, (socket) => {
				this.sockets.set(socket.id, socket);
				this.nsps.set(nsp.name, socket);
				if (this.connectTimeout) {
					clearTimeout(this.connectTimeout);
					this.connectTimeout = void 0;
				}
			});
		}
		/**
		* Disconnects from all namespaces and closes transport.
		*
		* @private
		*/
		_disconnect() {
			for (const socket of this.sockets.values()) socket.disconnect();
			this.sockets.clear();
			this.close();
		}
		/**
		* Removes a socket. Called by each `Socket`.
		*
		* @private
		*/
		_remove(socket) {
			if (this.sockets.has(socket.id)) {
				const nsp = this.sockets.get(socket.id).nsp.name;
				this.sockets.delete(socket.id);
				this.nsps.delete(nsp);
			} else debug("ignoring remove for %s", socket.id);
		}
		/**
		* Closes the underlying connection.
		*
		* @private
		*/
		close() {
			if ("open" === this.conn.readyState) {
				debug("forcing transport close");
				this.conn.close();
				this.onclose("forced server close");
			}
		}
		/**
		* Writes a packet to the transport.
		*
		* @param {Object} packet object
		* @param {Object} opts
		* @private
		*/
		_packet(packet, opts = {}) {
			if (this.conn.readyState !== "open") {
				debug("ignoring packet write %j", packet);
				return;
			}
			const encodedPackets = opts.preEncoded ? packet : this.encoder.encode(packet);
			this.writeToEngine(encodedPackets, opts);
		}
		writeToEngine(encodedPackets, opts) {
			if (opts.volatile && !this.conn.transport.writable) {
				debug("volatile packet is discarded since the transport is not currently writable");
				return;
			}
			const packets = Array.isArray(encodedPackets) ? encodedPackets : [encodedPackets];
			for (const encodedPacket of packets) this.conn.write(encodedPacket, opts);
		}
		/**
		* Called with incoming transport data.
		*
		* @private
		*/
		ondata(data) {
			try {
				this.decoder.add(data);
			} catch (e) {
				debug("invalid packet format");
				this.onerror(e);
			}
		}
		/**
		* Called when parser fully decodes a packet.
		*
		* @private
		*/
		ondecoded(packet) {
			const { namespace, authPayload } = this._parseNamespace(packet);
			const socket = this.nsps.get(namespace);
			if (!socket && packet.type === socket_io_parser_1.PacketType.CONNECT) this.connect(namespace, authPayload);
			else if (socket && packet.type !== socket_io_parser_1.PacketType.CONNECT && packet.type !== socket_io_parser_1.PacketType.CONNECT_ERROR) process.nextTick(function() {
				socket._onpacket(packet);
			});
			else {
				debug("invalid state (packet type: %s)", packet.type);
				this.close();
			}
		}
		_parseNamespace(packet) {
			if (this.conn.protocol !== 3) return {
				namespace: packet.nsp,
				authPayload: packet.data
			};
			const url = new URL(packet.nsp, "https://socket.io");
			return {
				namespace: url.pathname,
				authPayload: Object.fromEntries(url.searchParams.entries())
			};
		}
		/**
		* Handles an error.
		*
		* @param {Object} err object
		* @private
		*/
		onerror(err) {
			for (const socket of this.sockets.values()) socket._onerror(err);
			this.conn.close();
		}
		/**
		* Called upon transport close.
		*
		* @param reason
		* @param description
		* @private
		*/
		onclose(reason, description) {
			debug("client close with reason %s", reason);
			this.destroy();
			for (const socket of this.sockets.values()) socket._onclose(reason, description);
			this.sockets.clear();
			this.decoder.destroy();
		}
		/**
		* Cleans up event listeners.
		* @private
		*/
		destroy() {
			this.conn.removeListener("data", this.ondata);
			this.conn.removeListener("error", this.onerror);
			this.conn.removeListener("close", this.onclose);
			this.decoder.removeListener("decoded", this.ondecoded);
			if (this.connectTimeout) {
				clearTimeout(this.connectTimeout);
				this.connectTimeout = void 0;
			}
		}
	};
	exports.Client = Client;
}));
//#endregion
//#region node_modules/socket.io/dist/typed-events.js
var require_typed_events = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.StrictEventEmitter = void 0;
	var events_1$2 = require("events");
	/**
	* Strictly typed version of an `EventEmitter`. A `TypedEventEmitter` takes type
	* parameters for mappings of event names to event data types, and strictly
	* types method calls to the `EventEmitter` according to these event maps.
	*
	* @typeParam ListenEvents - `EventsMap` of user-defined events that can be
	* listened to with `on` or `once`
	* @typeParam EmitEvents - `EventsMap` of user-defined events that can be
	* emitted with `emit`
	* @typeParam ReservedEvents - `EventsMap` of reserved events, that can be
	* emitted by socket.io with `emitReserved`, and can be listened to with
	* `listen`.
	*/
	var StrictEventEmitter = class extends events_1$2.EventEmitter {
		/**
		* Adds the `listener` function as an event listener for `ev`.
		*
		* @param ev Name of the event
		* @param listener Callback function
		*/
		on(ev, listener) {
			return super.on(ev, listener);
		}
		/**
		* Adds a one-time `listener` function as an event listener for `ev`.
		*
		* @param ev Name of the event
		* @param listener Callback function
		*/
		once(ev, listener) {
			return super.once(ev, listener);
		}
		/**
		* Emits an event.
		*
		* @param ev Name of the event
		* @param args Values to send to listeners of this event
		*/
		emit(ev, ...args) {
			return super.emit(ev, ...args);
		}
		/**
		* Emits a reserved event.
		*
		* This method is `protected`, so that only a class extending
		* `StrictEventEmitter` can emit its own reserved events.
		*
		* @param ev Reserved event name
		* @param args Arguments to emit along with the event
		*/
		emitReserved(ev, ...args) {
			return super.emit(ev, ...args);
		}
		/**
		* Emits an event.
		*
		* This method is `protected`, so that only a class extending
		* `StrictEventEmitter` can get around the strict typing. This is useful for
		* calling `emit.apply`, which can be called as `emitUntyped.apply`.
		*
		* @param ev Event name
		* @param args Arguments to emit along with the event
		*/
		emitUntyped(ev, ...args) {
			return super.emit(ev, ...args);
		}
		/**
		* Returns the listeners listening to an event.
		*
		* @param event Event name
		* @returns Array of listeners subscribed to `event`
		*/
		listeners(event) {
			return super.listeners(event);
		}
	};
	exports.StrictEventEmitter = StrictEventEmitter;
}));
//#endregion
//#region node_modules/socket.io/dist/socket-types.js
var require_socket_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RESERVED_EVENTS = void 0;
	exports.RESERVED_EVENTS = /* @__PURE__ */ new Set([
		"connect",
		"connect_error",
		"disconnect",
		"disconnecting",
		"newListener",
		"removeListener"
	]);
}));
//#endregion
//#region node_modules/socket.io/dist/broadcast-operator.js
var require_broadcast_operator = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RemoteSocket = exports.BroadcastOperator = void 0;
	var socket_types_1 = require_socket_types();
	var socket_io_parser_1 = require_cjs();
	var BroadcastOperator = class BroadcastOperator {
		constructor(adapter, rooms = /* @__PURE__ */ new Set(), exceptRooms = /* @__PURE__ */ new Set(), flags = {}) {
			this.adapter = adapter;
			this.rooms = rooms;
			this.exceptRooms = exceptRooms;
			this.flags = flags;
		}
		/**
		* Targets a room when emitting.
		*
		* @example
		* // the “foo” event will be broadcast to all connected clients in the “room-101” room
		* io.to("room-101").emit("foo", "bar");
		*
		* // with an array of rooms (a client will be notified at most once)
		* io.to(["room-101", "room-102"]).emit("foo", "bar");
		*
		* // with multiple chained calls
		* io.to("room-101").to("room-102").emit("foo", "bar");
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		to(room) {
			const rooms = new Set(this.rooms);
			if (Array.isArray(room)) room.forEach((r) => rooms.add(r));
			else rooms.add(room);
			return new BroadcastOperator(this.adapter, rooms, this.exceptRooms, this.flags);
		}
		/**
		* Targets a room when emitting. Similar to `to()`, but might feel clearer in some cases:
		*
		* @example
		* // disconnect all clients in the "room-101" room
		* io.in("room-101").disconnectSockets();
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		in(room) {
			return this.to(room);
		}
		/**
		* Excludes a room when emitting.
		*
		* @example
		* // the "foo" event will be broadcast to all connected clients, except the ones that are in the "room-101" room
		* io.except("room-101").emit("foo", "bar");
		*
		* // with an array of rooms
		* io.except(["room-101", "room-102"]).emit("foo", "bar");
		*
		* // with multiple chained calls
		* io.except("room-101").except("room-102").emit("foo", "bar");
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		except(room) {
			const exceptRooms = new Set(this.exceptRooms);
			if (Array.isArray(room)) room.forEach((r) => exceptRooms.add(r));
			else exceptRooms.add(room);
			return new BroadcastOperator(this.adapter, this.rooms, exceptRooms, this.flags);
		}
		/**
		* Sets the compress flag.
		*
		* @example
		* io.compress(false).emit("hello");
		*
		* @param compress - if `true`, compresses the sending data
		* @return a new BroadcastOperator instance
		*/
		compress(compress) {
			const flags = Object.assign({}, this.flags, { compress });
			return new BroadcastOperator(this.adapter, this.rooms, this.exceptRooms, flags);
		}
		/**
		* Sets a modifier for a subsequent event emission that the event data may be lost if the client is not ready to
		* receive messages (because of network slowness or other issues, or because they’re connected through long polling
		* and is in the middle of a request-response cycle).
		*
		* @example
		* io.volatile.emit("hello"); // the clients may or may not receive it
		*
		* @return a new BroadcastOperator instance
		*/
		get volatile() {
			const flags = Object.assign({}, this.flags, { volatile: true });
			return new BroadcastOperator(this.adapter, this.rooms, this.exceptRooms, flags);
		}
		/**
		* Sets a modifier for a subsequent event emission that the event data will only be broadcast to the current node.
		*
		* @example
		* // the “foo” event will be broadcast to all connected clients on this node
		* io.local.emit("foo", "bar");
		*
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		get local() {
			const flags = Object.assign({}, this.flags, { local: true });
			return new BroadcastOperator(this.adapter, this.rooms, this.exceptRooms, flags);
		}
		/**
		* Adds a timeout in milliseconds for the next operation
		*
		* @example
		* io.timeout(1000).emit("some-event", (err, responses) => {
		*   if (err) {
		*     // some clients did not acknowledge the event in the given delay
		*   } else {
		*     console.log(responses); // one response per client
		*   }
		* });
		*
		* @param timeout
		*/
		timeout(timeout) {
			const flags = Object.assign({}, this.flags, { timeout });
			return new BroadcastOperator(this.adapter, this.rooms, this.exceptRooms, flags);
		}
		/**
		* Emits to all clients.
		*
		* @example
		* // the “foo” event will be broadcast to all connected clients
		* io.emit("foo", "bar");
		*
		* // the “foo” event will be broadcast to all connected clients in the “room-101” room
		* io.to("room-101").emit("foo", "bar");
		*
		* // with an acknowledgement expected from all connected clients
		* io.timeout(1000).emit("some-event", (err, responses) => {
		*   if (err) {
		*     // some clients did not acknowledge the event in the given delay
		*   } else {
		*     console.log(responses); // one response per client
		*   }
		* });
		*
		* @return Always true
		*/
		emit(ev, ...args) {
			if (socket_types_1.RESERVED_EVENTS.has(ev)) throw new Error(`"${String(ev)}" is a reserved event name`);
			const data = [ev, ...args];
			const packet = {
				type: socket_io_parser_1.PacketType.EVENT,
				data
			};
			if (!(typeof data[data.length - 1] === "function")) {
				this.adapter.broadcast(packet, {
					rooms: this.rooms,
					except: this.exceptRooms,
					flags: this.flags
				});
				return true;
			}
			const ack = data.pop();
			let timedOut = false;
			let responses = [];
			const timer = setTimeout(() => {
				timedOut = true;
				ack.apply(this, [/* @__PURE__ */ new Error("operation has timed out"), this.flags.expectSingleResponse ? null : responses]);
			}, this.flags.timeout);
			let expectedServerCount = -1;
			let actualServerCount = 0;
			let expectedClientCount = 0;
			const checkCompleteness = () => {
				if (!timedOut && expectedServerCount === actualServerCount && responses.length === expectedClientCount) {
					clearTimeout(timer);
					ack.apply(this, [null, this.flags.expectSingleResponse ? responses[0] : responses]);
				}
			};
			this.adapter.broadcastWithAck(packet, {
				rooms: this.rooms,
				except: this.exceptRooms,
				flags: this.flags
			}, (clientCount) => {
				expectedClientCount += clientCount;
				actualServerCount++;
				checkCompleteness();
			}, (clientResponse) => {
				responses.push(clientResponse);
				checkCompleteness();
			});
			this.adapter.serverCount().then((serverCount) => {
				expectedServerCount = serverCount;
				checkCompleteness();
			});
			return true;
		}
		/**
		* Emits an event and waits for an acknowledgement from all clients.
		*
		* @example
		* try {
		*   const responses = await io.timeout(1000).emitWithAck("some-event");
		*   console.log(responses); // one response per client
		* } catch (e) {
		*   // some clients did not acknowledge the event in the given delay
		* }
		*
		* @return a Promise that will be fulfilled when all clients have acknowledged the event
		*/
		emitWithAck(ev, ...args) {
			return new Promise((resolve, reject) => {
				args.push((err, responses) => {
					if (err) {
						err.responses = responses;
						return reject(err);
					} else return resolve(responses);
				});
				this.emit(ev, ...args);
			});
		}
		/**
		* Gets a list of clients.
		*
		* @deprecated this method will be removed in the next major release, please use {@link Server#serverSideEmit} or
		* {@link fetchSockets} instead.
		*/
		allSockets() {
			if (!this.adapter) throw new Error("No adapter for this namespace, are you trying to get the list of clients of a dynamic namespace?");
			return this.adapter.sockets(this.rooms);
		}
		/**
		* Returns the matching socket instances. This method works across a cluster of several Socket.IO servers.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		* // return all Socket instances
		* const sockets = await io.fetchSockets();
		*
		* // return all Socket instances in the "room1" room
		* const sockets = await io.in("room1").fetchSockets();
		*
		* for (const socket of sockets) {
		*   console.log(socket.id);
		*   console.log(socket.handshake);
		*   console.log(socket.rooms);
		*   console.log(socket.data);
		*
		*   socket.emit("hello");
		*   socket.join("room1");
		*   socket.leave("room2");
		*   socket.disconnect();
		* }
		*/
		fetchSockets() {
			return this.adapter.fetchSockets({
				rooms: this.rooms,
				except: this.exceptRooms,
				flags: this.flags
			}).then((sockets) => {
				return sockets.map((socket) => {
					if (socket.server) return socket;
					else return new RemoteSocket(this.adapter, socket);
				});
			});
		}
		/**
		* Makes the matching socket instances join the specified rooms.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		*
		* // make all socket instances join the "room1" room
		* io.socketsJoin("room1");
		*
		* // make all socket instances in the "room1" room join the "room2" and "room3" rooms
		* io.in("room1").socketsJoin(["room2", "room3"]);
		*
		* @param room - a room, or an array of rooms
		*/
		socketsJoin(room) {
			this.adapter.addSockets({
				rooms: this.rooms,
				except: this.exceptRooms,
				flags: this.flags
			}, Array.isArray(room) ? room : [room]);
		}
		/**
		* Makes the matching socket instances leave the specified rooms.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		* // make all socket instances leave the "room1" room
		* io.socketsLeave("room1");
		*
		* // make all socket instances in the "room1" room leave the "room2" and "room3" rooms
		* io.in("room1").socketsLeave(["room2", "room3"]);
		*
		* @param room - a room, or an array of rooms
		*/
		socketsLeave(room) {
			this.adapter.delSockets({
				rooms: this.rooms,
				except: this.exceptRooms,
				flags: this.flags
			}, Array.isArray(room) ? room : [room]);
		}
		/**
		* Makes the matching socket instances disconnect.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		* // make all socket instances disconnect (the connections might be kept alive for other namespaces)
		* io.disconnectSockets();
		*
		* // make all socket instances in the "room1" room disconnect and close the underlying connections
		* io.in("room1").disconnectSockets(true);
		*
		* @param close - whether to close the underlying connection
		*/
		disconnectSockets(close = false) {
			this.adapter.disconnectSockets({
				rooms: this.rooms,
				except: this.exceptRooms,
				flags: this.flags
			}, close);
		}
	};
	exports.BroadcastOperator = BroadcastOperator;
	/**
	* Expose of subset of the attributes and methods of the Socket class
	*/
	var RemoteSocket = class {
		constructor(adapter, details) {
			this.id = details.id;
			this.handshake = details.handshake;
			this.rooms = new Set(details.rooms);
			this.data = details.data;
			this.operator = new BroadcastOperator(adapter, /* @__PURE__ */ new Set([this.id]), /* @__PURE__ */ new Set(), { expectSingleResponse: true });
		}
		/**
		* Adds a timeout in milliseconds for the next operation.
		*
		* @example
		* const sockets = await io.fetchSockets();
		*
		* for (const socket of sockets) {
		*   if (someCondition) {
		*     socket.timeout(1000).emit("some-event", (err) => {
		*       if (err) {
		*         // the client did not acknowledge the event in the given delay
		*       }
		*     });
		*   }
		* }
		*
		* // note: if possible, using a room instead of looping over all sockets is preferable
		* io.timeout(1000).to(someConditionRoom).emit("some-event", (err, responses) => {
		*   // ...
		* });
		*
		* @param timeout
		*/
		timeout(timeout) {
			return this.operator.timeout(timeout);
		}
		emit(ev, ...args) {
			return this.operator.emit(ev, ...args);
		}
		/**
		* Joins a room.
		*
		* @param {String|Array} room - room or array of rooms
		*/
		join(room) {
			return this.operator.socketsJoin(room);
		}
		/**
		* Leaves a room.
		*
		* @param {String} room
		*/
		leave(room) {
			return this.operator.socketsLeave(room);
		}
		/**
		* Disconnects this client.
		*
		* @param {Boolean} close - if `true`, closes the underlying connection
		* @return {Socket} self
		*/
		disconnect(close = false) {
			this.operator.disconnectSockets(close);
			return this;
		}
	};
	exports.RemoteSocket = RemoteSocket;
}));
//#endregion
//#region node_modules/socket.io/dist/socket.js
var require_socket = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Socket = void 0;
	var socket_io_parser_1 = require_cjs();
	var debug_1 = __importDefault(require_src());
	var typed_events_1 = require_typed_events();
	var base64id_1 = __importDefault(require_base64id());
	var broadcast_operator_1 = require_broadcast_operator();
	var socket_types_1 = require_socket_types();
	var debug = (0, debug_1.default)("socket.io:socket");
	var RECOVERABLE_DISCONNECT_REASONS = /* @__PURE__ */ new Set([
		"transport error",
		"transport close",
		"forced close",
		"ping timeout",
		"server shutting down",
		"forced server close"
	]);
	function noop() {}
	/**
	* This is the main object for interacting with a client.
	*
	* A Socket belongs to a given {@link Namespace} and uses an underlying {@link Client} to communicate.
	*
	* Within each {@link Namespace}, you can also define arbitrary channels (called "rooms") that the {@link Socket} can
	* join and leave. That provides a convenient way to broadcast to a group of socket instances.
	*
	* @example
	* io.on("connection", (socket) => {
	*   console.log(`socket ${socket.id} connected`);
	*
	*   // send an event to the client
	*   socket.emit("foo", "bar");
	*
	*   socket.on("foobar", () => {
	*     // an event was received from the client
	*   });
	*
	*   // join the room named "room1"
	*   socket.join("room1");
	*
	*   // broadcast to everyone in the room named "room1"
	*   io.to("room1").emit("hello");
	*
	*   // upon disconnection
	*   socket.on("disconnect", (reason) => {
	*     console.log(`socket ${socket.id} disconnected due to ${reason}`);
	*   });
	* });
	*/
	var Socket = class extends typed_events_1.StrictEventEmitter {
		/**
		* Interface to a `Client` for a given `Namespace`.
		*
		* @param {Namespace} nsp
		* @param {Client} client
		* @param {Object} auth
		* @package
		*/
		constructor(nsp, client, auth, previousSession) {
			super();
			this.nsp = nsp;
			this.client = client;
			/**
			* Whether the connection state was recovered after a temporary disconnection. In that case, any missed packets will
			* be transmitted to the client, the data attribute and the rooms will be restored.
			*/
			this.recovered = false;
			/**
			* Additional information that can be attached to the Socket instance and which will be used in the
			* {@link Server.fetchSockets()} method.
			*/
			this.data = {};
			/**
			* Whether the socket is currently connected or not.
			*
			* @example
			* io.use((socket, next) => {
			*   console.log(socket.connected); // false
			*   next();
			* });
			*
			* io.on("connection", (socket) => {
			*   console.log(socket.connected); // true
			* });
			*/
			this.connected = false;
			this.acks = /* @__PURE__ */ new Map();
			this.fns = [];
			this.flags = {};
			this.server = nsp.server;
			this.adapter = nsp.adapter;
			if (previousSession) {
				this.id = previousSession.sid;
				this.pid = previousSession.pid;
				previousSession.rooms.forEach((room) => this.join(room));
				this.data = previousSession.data;
				previousSession.missedPackets.forEach((packet) => {
					this.packet({
						type: socket_io_parser_1.PacketType.EVENT,
						data: packet
					});
				});
				this.recovered = true;
			} else {
				if (client.conn.protocol === 3) this.id = nsp.name !== "/" ? nsp.name + "#" + client.id : client.id;
				else this.id = base64id_1.default.generateId();
				if (this.server._opts.connectionStateRecovery) this.pid = base64id_1.default.generateId();
			}
			this.handshake = this.buildHandshake(auth);
			this.on("error", noop);
		}
		/**
		* Builds the `handshake` BC object
		*
		* @private
		*/
		buildHandshake(auth) {
			var _a, _b, _c, _d;
			return {
				headers: ((_a = this.request) === null || _a === void 0 ? void 0 : _a.headers) || {},
				time: /* @__PURE__ */ new Date() + "",
				address: this.conn.remoteAddress,
				xdomain: !!((_b = this.request) === null || _b === void 0 ? void 0 : _b.headers.origin),
				secure: !this.request || !!this.request.connection.encrypted,
				issued: +/* @__PURE__ */ new Date(),
				url: (_c = this.request) === null || _c === void 0 ? void 0 : _c.url,
				query: ((_d = this.request) === null || _d === void 0 ? void 0 : _d._query) || {},
				auth
			};
		}
		/**
		* Emits to this client.
		*
		* @example
		* io.on("connection", (socket) => {
		*   socket.emit("hello", "world");
		*
		*   // all serializable datastructures are supported (no need to call JSON.stringify)
		*   socket.emit("hello", 1, "2", { 3: ["4"], 5: Buffer.from([6]) });
		*
		*   // with an acknowledgement from the client
		*   socket.emit("hello", "world", (val) => {
		*     // ...
		*   });
		* });
		*
		* @return Always returns `true`.
		*/
		emit(ev, ...args) {
			if (socket_types_1.RESERVED_EVENTS.has(ev)) throw new Error(`"${String(ev)}" is a reserved event name`);
			const data = [ev, ...args];
			const packet = {
				type: socket_io_parser_1.PacketType.EVENT,
				data
			};
			if (typeof data[data.length - 1] === "function") {
				const id = this.nsp._ids++;
				debug("emitting packet with ack id %d", id);
				this.registerAckCallback(id, data.pop());
				packet.id = id;
			}
			const flags = Object.assign({}, this.flags);
			this.flags = {};
			if (this.nsp.server.opts.connectionStateRecovery) this.adapter.broadcast(packet, {
				rooms: /* @__PURE__ */ new Set([this.id]),
				except: /* @__PURE__ */ new Set(),
				flags
			});
			else {
				this.notifyOutgoingListeners(packet);
				this.packet(packet, flags);
			}
			return true;
		}
		/**
		* Emits an event and waits for an acknowledgement
		*
		* @example
		* io.on("connection", async (socket) => {
		*   // without timeout
		*   const response = await socket.emitWithAck("hello", "world");
		*
		*   // with a specific timeout
		*   try {
		*     const response = await socket.timeout(1000).emitWithAck("hello", "world");
		*   } catch (err) {
		*     // the client did not acknowledge the event in the given delay
		*   }
		* });
		*
		* @return a Promise that will be fulfilled when the client acknowledges the event
		*/
		emitWithAck(ev, ...args) {
			const withErr = this.flags.timeout !== void 0;
			return new Promise((resolve, reject) => {
				args.push((arg1, arg2) => {
					if (withErr) return arg1 ? reject(arg1) : resolve(arg2);
					else return resolve(arg1);
				});
				this.emit(ev, ...args);
			});
		}
		/**
		* @private
		*/
		registerAckCallback(id, ack) {
			const timeout = this.flags.timeout;
			if (timeout === void 0) {
				this.acks.set(id, ack);
				return;
			}
			const timer = setTimeout(() => {
				debug("event with ack id %d has timed out after %d ms", id, timeout);
				this.acks.delete(id);
				ack.call(this, /* @__PURE__ */ new Error("operation has timed out"));
			}, timeout);
			this.acks.set(id, (...args) => {
				clearTimeout(timer);
				ack.apply(this, [null, ...args]);
			});
		}
		/**
		* Targets a room when broadcasting.
		*
		* @example
		* io.on("connection", (socket) => {
		*   // the “foo” event will be broadcast to all connected clients in the “room-101” room, except this socket
		*   socket.to("room-101").emit("foo", "bar");
		*
		*   // the code above is equivalent to:
		*   io.to("room-101").except(socket.id).emit("foo", "bar");
		*
		*   // with an array of rooms (a client will be notified at most once)
		*   socket.to(["room-101", "room-102"]).emit("foo", "bar");
		*
		*   // with multiple chained calls
		*   socket.to("room-101").to("room-102").emit("foo", "bar");
		* });
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		to(room) {
			return this.newBroadcastOperator().to(room);
		}
		/**
		* Targets a room when broadcasting. Similar to `to()`, but might feel clearer in some cases:
		*
		* @example
		* io.on("connection", (socket) => {
		*   // disconnect all clients in the "room-101" room, except this socket
		*   socket.in("room-101").disconnectSockets();
		* });
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		in(room) {
			return this.newBroadcastOperator().in(room);
		}
		/**
		* Excludes a room when broadcasting.
		*
		* @example
		* io.on("connection", (socket) => {
		*   // the "foo" event will be broadcast to all connected clients, except the ones that are in the "room-101" room
		*   // and this socket
		*   socket.except("room-101").emit("foo", "bar");
		*
		*   // with an array of rooms
		*   socket.except(["room-101", "room-102"]).emit("foo", "bar");
		*
		*   // with multiple chained calls
		*   socket.except("room-101").except("room-102").emit("foo", "bar");
		* });
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		except(room) {
			return this.newBroadcastOperator().except(room);
		}
		/**
		* Sends a `message` event.
		*
		* This method mimics the WebSocket.send() method.
		*
		* @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
		*
		* @example
		* io.on("connection", (socket) => {
		*   socket.send("hello");
		*
		*   // this is equivalent to
		*   socket.emit("message", "hello");
		* });
		*
		* @return self
		*/
		send(...args) {
			this.emit("message", ...args);
			return this;
		}
		/**
		* Sends a `message` event. Alias of {@link send}.
		*
		* @return self
		*/
		write(...args) {
			this.emit("message", ...args);
			return this;
		}
		/**
		* Writes a packet.
		*
		* @param {Object} packet - packet object
		* @param {Object} opts - options
		* @private
		*/
		packet(packet, opts = {}) {
			packet.nsp = this.nsp.name;
			opts.compress = false !== opts.compress;
			this.client._packet(packet, opts);
		}
		/**
		* Joins a room.
		*
		* @example
		* io.on("connection", (socket) => {
		*   // join a single room
		*   socket.join("room1");
		*
		*   // join multiple rooms
		*   socket.join(["room1", "room2"]);
		* });
		*
		* @param {String|Array} rooms - room or array of rooms
		* @return a Promise or nothing, depending on the adapter
		*/
		join(rooms) {
			debug("join room %s", rooms);
			return this.adapter.addAll(this.id, new Set(Array.isArray(rooms) ? rooms : [rooms]));
		}
		/**
		* Leaves a room.
		*
		* @example
		* io.on("connection", (socket) => {
		*   // leave a single room
		*   socket.leave("room1");
		*
		*   // leave multiple rooms
		*   socket.leave("room1").leave("room2");
		* });
		*
		* @param {String} room
		* @return a Promise or nothing, depending on the adapter
		*/
		leave(room) {
			debug("leave room %s", room);
			return this.adapter.del(this.id, room);
		}
		/**
		* Leave all rooms.
		*
		* @private
		*/
		leaveAll() {
			this.adapter.delAll(this.id);
		}
		/**
		* Called by `Namespace` upon successful
		* middleware execution (ie: authorization).
		* Socket is added to namespace array before
		* call to join, so adapters can access it.
		*
		* @private
		*/
		_onconnect() {
			debug("socket connected - writing packet");
			this.connected = true;
			this.join(this.id);
			if (this.conn.protocol === 3) this.packet({ type: socket_io_parser_1.PacketType.CONNECT });
			else this.packet({
				type: socket_io_parser_1.PacketType.CONNECT,
				data: {
					sid: this.id,
					pid: this.pid
				}
			});
		}
		/**
		* Called with each packet. Called by `Client`.
		*
		* @param {Object} packet
		* @private
		*/
		_onpacket(packet) {
			debug("got packet %j", packet);
			switch (packet.type) {
				case socket_io_parser_1.PacketType.EVENT:
					this.onevent(packet);
					break;
				case socket_io_parser_1.PacketType.BINARY_EVENT:
					this.onevent(packet);
					break;
				case socket_io_parser_1.PacketType.ACK:
					this.onack(packet);
					break;
				case socket_io_parser_1.PacketType.BINARY_ACK:
					this.onack(packet);
					break;
				case socket_io_parser_1.PacketType.DISCONNECT: this.ondisconnect();
			}
		}
		/**
		* Called upon event packet.
		*
		* @param {Packet} packet - packet object
		* @private
		*/
		onevent(packet) {
			const args = packet.data || [];
			debug("emitting event %j", args);
			if (null != packet.id) {
				debug("attaching ack callback to event");
				args.push(this.ack(packet.id));
			}
			if (this._anyListeners && this._anyListeners.length) {
				const listeners = this._anyListeners.slice();
				for (const listener of listeners) listener.apply(this, args);
			}
			this.dispatch(args);
		}
		/**
		* Produces an ack callback to emit with an event.
		*
		* @param {Number} id - packet id
		* @private
		*/
		ack(id) {
			const self = this;
			let sent = false;
			return function() {
				if (sent) return;
				const args = Array.prototype.slice.call(arguments);
				debug("sending ack %j", args);
				self.packet({
					id,
					type: socket_io_parser_1.PacketType.ACK,
					data: args
				});
				sent = true;
			};
		}
		/**
		* Called upon ack packet.
		*
		* @private
		*/
		onack(packet) {
			const ack = this.acks.get(packet.id);
			if ("function" == typeof ack) {
				debug("calling ack %s with %j", packet.id, packet.data);
				ack.apply(this, packet.data);
				this.acks.delete(packet.id);
			} else debug("bad ack %s", packet.id);
		}
		/**
		* Called upon client disconnect packet.
		*
		* @private
		*/
		ondisconnect() {
			debug("got disconnect packet");
			this._onclose("client namespace disconnect");
		}
		/**
		* Handles a client error.
		*
		* @private
		*/
		_onerror(err) {
			this.emitReserved("error", err);
		}
		/**
		* Called upon closing. Called by `Client`.
		*
		* @param {String} reason
		* @param description
		* @throw {Error} optional error object
		*
		* @private
		*/
		_onclose(reason, description) {
			if (!this.connected) return this;
			debug("closing socket - reason %s", reason);
			this.emitReserved("disconnecting", reason, description);
			if (this.server._opts.connectionStateRecovery && RECOVERABLE_DISCONNECT_REASONS.has(reason)) {
				debug("connection state recovery is enabled for sid %s", this.id);
				this.adapter.persistSession({
					sid: this.id,
					pid: this.pid,
					rooms: [...this.rooms],
					data: this.data
				});
			}
			this._cleanup();
			this.client._remove(this);
			this.connected = false;
			this.emitReserved("disconnect", reason, description);
		}
		/**
		* Makes the socket leave all the rooms it was part of and prevents it from joining any other room
		*
		* @private
		*/
		_cleanup() {
			this.leaveAll();
			this.nsp._remove(this);
			this.join = noop;
		}
		/**
		* Produces an `error` packet.
		*
		* @param {Object} err - error object
		*
		* @private
		*/
		_error(err) {
			this.packet({
				type: socket_io_parser_1.PacketType.CONNECT_ERROR,
				data: err
			});
		}
		/**
		* Disconnects this client.
		*
		* @example
		* io.on("connection", (socket) => {
		*   // disconnect this socket (the connection might be kept alive for other namespaces)
		*   socket.disconnect();
		*
		*   // disconnect this socket and close the underlying connection
		*   socket.disconnect(true);
		* })
		*
		* @param {Boolean} close - if `true`, closes the underlying connection
		* @return self
		*/
		disconnect(close = false) {
			if (!this.connected) return this;
			if (close) this.client._disconnect();
			else {
				this.packet({ type: socket_io_parser_1.PacketType.DISCONNECT });
				this._onclose("server namespace disconnect");
			}
			return this;
		}
		/**
		* Sets the compress flag.
		*
		* @example
		* io.on("connection", (socket) => {
		*   socket.compress(false).emit("hello");
		* });
		*
		* @param {Boolean} compress - if `true`, compresses the sending data
		* @return {Socket} self
		*/
		compress(compress) {
			this.flags.compress = compress;
			return this;
		}
		/**
		* Sets a modifier for a subsequent event emission that the event data may be lost if the client is not ready to
		* receive messages (because of network slowness or other issues, or because they’re connected through long polling
		* and is in the middle of a request-response cycle).
		*
		* @example
		* io.on("connection", (socket) => {
		*   socket.volatile.emit("hello"); // the client may or may not receive it
		* });
		*
		* @return {Socket} self
		*/
		get volatile() {
			this.flags.volatile = true;
			return this;
		}
		/**
		* Sets a modifier for a subsequent event emission that the event data will only be broadcast to every sockets but the
		* sender.
		*
		* @example
		* io.on("connection", (socket) => {
		*   // the “foo” event will be broadcast to all connected clients, except this socket
		*   socket.broadcast.emit("foo", "bar");
		* });
		*
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		get broadcast() {
			return this.newBroadcastOperator();
		}
		/**
		* Sets a modifier for a subsequent event emission that the event data will only be broadcast to the current node.
		*
		* @example
		* io.on("connection", (socket) => {
		*   // the “foo” event will be broadcast to all connected clients on this node, except this socket
		*   socket.local.emit("foo", "bar");
		* });
		*
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		get local() {
			return this.newBroadcastOperator().local;
		}
		/**
		* Sets a modifier for a subsequent event emission that the callback will be called with an error when the
		* given number of milliseconds have elapsed without an acknowledgement from the client:
		*
		* @example
		* io.on("connection", (socket) => {
		*   socket.timeout(5000).emit("my-event", (err) => {
		*     if (err) {
		*       // the client did not acknowledge the event in the given delay
		*     }
		*   });
		* });
		*
		* @returns self
		*/
		timeout(timeout) {
			this.flags.timeout = timeout;
			return this;
		}
		/**
		* Dispatch incoming event to socket listeners.
		*
		* @param {Array} event - event that will get emitted
		* @private
		*/
		dispatch(event) {
			debug("dispatching an event %j", event);
			this.run(event, (err) => {
				process.nextTick(() => {
					if (err) return this._onerror(err);
					if (this.connected) super.emitUntyped.apply(this, event);
					else debug("ignore packet received after disconnection");
				});
			});
		}
		/**
		* Sets up socket middleware.
		*
		* @example
		* io.on("connection", (socket) => {
		*   socket.use(([event, ...args], next) => {
		*     if (isUnauthorized(event)) {
		*       return next(new Error("unauthorized event"));
		*     }
		*     // do not forget to call next
		*     next();
		*   });
		*
		*   socket.on("error", (err) => {
		*     if (err && err.message === "unauthorized event") {
		*       socket.disconnect();
		*     }
		*   });
		* });
		*
		* @param {Function} fn - middleware function (event, next)
		* @return {Socket} self
		*/
		use(fn) {
			this.fns.push(fn);
			return this;
		}
		/**
		* Executes the middleware for an incoming event.
		*
		* @param {Array} event - event that will get emitted
		* @param {Function} fn - last fn call in the middleware
		* @private
		*/
		run(event, fn) {
			if (!this.fns.length) return fn();
			const fns = this.fns.slice(0);
			function run(i) {
				fns[i](event, (err) => {
					if (err) return fn(err);
					if (!fns[i + 1]) return fn();
					run(i + 1);
				});
			}
			run(0);
		}
		/**
		* Whether the socket is currently disconnected
		*/
		get disconnected() {
			return !this.connected;
		}
		/**
		* A reference to the request that originated the underlying Engine.IO Socket.
		*/
		get request() {
			return this.client.request;
		}
		/**
		* A reference to the underlying Client transport connection (Engine.IO Socket object).
		*
		* @example
		* io.on("connection", (socket) => {
		*   console.log(socket.conn.transport.name); // prints "polling" or "websocket"
		*
		*   socket.conn.once("upgrade", () => {
		*     console.log(socket.conn.transport.name); // prints "websocket"
		*   });
		* });
		*/
		get conn() {
			return this.client.conn;
		}
		/**
		* Returns the rooms the socket is currently in.
		*
		* @example
		* io.on("connection", (socket) => {
		*   console.log(socket.rooms); // Set { <socket.id> }
		*
		*   socket.join("room1");
		*
		*   console.log(socket.rooms); // Set { <socket.id>, "room1" }
		* });
		*/
		get rooms() {
			return this.adapter.socketRooms(this.id) || /* @__PURE__ */ new Set();
		}
		/**
		* Adds a listener that will be fired when any event is received. The event name is passed as the first argument to
		* the callback.
		*
		* @example
		* io.on("connection", (socket) => {
		*   socket.onAny((event, ...args) => {
		*     console.log(`got event ${event}`);
		*   });
		* });
		*
		* @param listener
		*/
		onAny(listener) {
			this._anyListeners = this._anyListeners || [];
			this._anyListeners.push(listener);
			return this;
		}
		/**
		* Adds a listener that will be fired when any event is received. The event name is passed as the first argument to
		* the callback. The listener is added to the beginning of the listeners array.
		*
		* @param listener
		*/
		prependAny(listener) {
			this._anyListeners = this._anyListeners || [];
			this._anyListeners.unshift(listener);
			return this;
		}
		/**
		* Removes the listener that will be fired when any event is received.
		*
		* @example
		* io.on("connection", (socket) => {
		*   const catchAllListener = (event, ...args) => {
		*     console.log(`got event ${event}`);
		*   }
		*
		*   socket.onAny(catchAllListener);
		*
		*   // remove a specific listener
		*   socket.offAny(catchAllListener);
		*
		*   // or remove all listeners
		*   socket.offAny();
		* });
		*
		* @param listener
		*/
		offAny(listener) {
			if (!this._anyListeners) return this;
			if (listener) {
				const listeners = this._anyListeners;
				for (let i = 0; i < listeners.length; i++) if (listener === listeners[i]) {
					listeners.splice(i, 1);
					return this;
				}
			} else this._anyListeners = [];
			return this;
		}
		/**
		* Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
		* e.g. to remove listeners.
		*/
		listenersAny() {
			return this._anyListeners || [];
		}
		/**
		* Adds a listener that will be fired when any event is sent. The event name is passed as the first argument to
		* the callback.
		*
		* Note: acknowledgements sent to the client are not included.
		*
		* @example
		* io.on("connection", (socket) => {
		*   socket.onAnyOutgoing((event, ...args) => {
		*     console.log(`sent event ${event}`);
		*   });
		* });
		*
		* @param listener
		*/
		onAnyOutgoing(listener) {
			this._anyOutgoingListeners = this._anyOutgoingListeners || [];
			this._anyOutgoingListeners.push(listener);
			return this;
		}
		/**
		* Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
		* callback. The listener is added to the beginning of the listeners array.
		*
		* @example
		* io.on("connection", (socket) => {
		*   socket.prependAnyOutgoing((event, ...args) => {
		*     console.log(`sent event ${event}`);
		*   });
		* });
		*
		* @param listener
		*/
		prependAnyOutgoing(listener) {
			this._anyOutgoingListeners = this._anyOutgoingListeners || [];
			this._anyOutgoingListeners.unshift(listener);
			return this;
		}
		/**
		* Removes the listener that will be fired when any event is sent.
		*
		* @example
		* io.on("connection", (socket) => {
		*   const catchAllListener = (event, ...args) => {
		*     console.log(`sent event ${event}`);
		*   }
		*
		*   socket.onAnyOutgoing(catchAllListener);
		*
		*   // remove a specific listener
		*   socket.offAnyOutgoing(catchAllListener);
		*
		*   // or remove all listeners
		*   socket.offAnyOutgoing();
		* });
		*
		* @param listener - the catch-all listener
		*/
		offAnyOutgoing(listener) {
			if (!this._anyOutgoingListeners) return this;
			if (listener) {
				const listeners = this._anyOutgoingListeners;
				for (let i = 0; i < listeners.length; i++) if (listener === listeners[i]) {
					listeners.splice(i, 1);
					return this;
				}
			} else this._anyOutgoingListeners = [];
			return this;
		}
		/**
		* Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
		* e.g. to remove listeners.
		*/
		listenersAnyOutgoing() {
			return this._anyOutgoingListeners || [];
		}
		/**
		* Notify the listeners for each packet sent (emit or broadcast)
		*
		* @param packet
		*
		* @private
		*/
		notifyOutgoingListeners(packet) {
			if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
				const listeners = this._anyOutgoingListeners.slice();
				for (const listener of listeners) listener.apply(this, packet.data);
			}
		}
		newBroadcastOperator() {
			const flags = Object.assign({}, this.flags);
			this.flags = {};
			return new broadcast_operator_1.BroadcastOperator(this.adapter, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set([this.id]), flags);
		}
	};
	exports.Socket = Socket;
}));
//#endregion
//#region node_modules/socket.io/dist/namespace.js
var require_namespace = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Namespace = exports.RESERVED_EVENTS = void 0;
	var socket_1 = require_socket();
	var typed_events_1 = require_typed_events();
	var debug_1 = __importDefault(require_src());
	var broadcast_operator_1 = require_broadcast_operator();
	var debug = (0, debug_1.default)("socket.io:namespace");
	exports.RESERVED_EVENTS = /* @__PURE__ */ new Set([
		"connect",
		"connection",
		"new_namespace"
	]);
	/**
	* A Namespace is a communication channel that allows you to split the logic of your application over a single shared
	* connection.
	*
	* Each namespace has its own:
	*
	* - event handlers
	*
	* ```
	* io.of("/orders").on("connection", (socket) => {
	*   socket.on("order:list", () => {});
	*   socket.on("order:create", () => {});
	* });
	*
	* io.of("/users").on("connection", (socket) => {
	*   socket.on("user:list", () => {});
	* });
	* ```
	*
	* - rooms
	*
	* ```
	* const orderNamespace = io.of("/orders");
	*
	* orderNamespace.on("connection", (socket) => {
	*   socket.join("room1");
	*   orderNamespace.to("room1").emit("hello");
	* });
	*
	* const userNamespace = io.of("/users");
	*
	* userNamespace.on("connection", (socket) => {
	*   socket.join("room1"); // distinct from the room in the "orders" namespace
	*   userNamespace.to("room1").emit("holà");
	* });
	* ```
	*
	* - middlewares
	*
	* ```
	* const orderNamespace = io.of("/orders");
	*
	* orderNamespace.use((socket, next) => {
	*   // ensure the socket has access to the "orders" namespace
	* });
	*
	* const userNamespace = io.of("/users");
	*
	* userNamespace.use((socket, next) => {
	*   // ensure the socket has access to the "users" namespace
	* });
	* ```
	*/
	var Namespace = class extends typed_events_1.StrictEventEmitter {
		/**
		* Namespace constructor.
		*
		* @param server instance
		* @param name
		*/
		constructor(server, name) {
			super();
			/**
			* A map of currently connected sockets.
			*/
			this.sockets = /* @__PURE__ */ new Map();
			/**
			* A map of currently connecting sockets.
			*/
			this._preConnectSockets = /* @__PURE__ */ new Map();
			this._fns = [];
			/** @private */
			this._ids = 0;
			this.server = server;
			this.name = name;
			this._initAdapter();
		}
		/**
		* Initializes the `Adapter` for this nsp.
		* Run upon changing adapter by `Server#adapter`
		* in addition to the constructor.
		*
		* @private
		*/
		_initAdapter() {
			this.adapter = new (this.server.adapter())(this);
			Promise.resolve(this.adapter.init()).catch((err) => {
				debug("error while initializing adapter: %s", err);
			});
		}
		/**
		* Registers a middleware, which is a function that gets executed for every incoming {@link Socket}.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* myNamespace.use((socket, next) => {
		*   // ...
		*   next();
		* });
		*
		* @param fn - the middleware function
		*/
		use(fn) {
			this._fns.push(fn);
			return this;
		}
		/**
		* Executes the middleware for an incoming client.
		*
		* @param socket - the socket that will get added
		* @param fn - last fn call in the middleware
		* @private
		*/
		run(socket, fn) {
			if (!this._fns.length) return fn();
			const fns = this._fns.slice(0);
			function run(i) {
				fns[i](socket, (err) => {
					if (err) return fn(err);
					if (!fns[i + 1]) return fn();
					run(i + 1);
				});
			}
			run(0);
		}
		/**
		* Targets a room when emitting.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* // the “foo” event will be broadcast to all connected clients in the “room-101” room
		* myNamespace.to("room-101").emit("foo", "bar");
		*
		* // with an array of rooms (a client will be notified at most once)
		* myNamespace.to(["room-101", "room-102"]).emit("foo", "bar");
		*
		* // with multiple chained calls
		* myNamespace.to("room-101").to("room-102").emit("foo", "bar");
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		to(room) {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).to(room);
		}
		/**
		* Targets a room when emitting. Similar to `to()`, but might feel clearer in some cases:
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* // disconnect all clients in the "room-101" room
		* myNamespace.in("room-101").disconnectSockets();
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		in(room) {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).in(room);
		}
		/**
		* Excludes a room when emitting.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* // the "foo" event will be broadcast to all connected clients, except the ones that are in the "room-101" room
		* myNamespace.except("room-101").emit("foo", "bar");
		*
		* // with an array of rooms
		* myNamespace.except(["room-101", "room-102"]).emit("foo", "bar");
		*
		* // with multiple chained calls
		* myNamespace.except("room-101").except("room-102").emit("foo", "bar");
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		except(room) {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).except(room);
		}
		/**
		* Adds a new client.
		*
		* @return {Socket}
		* @private
		*/
		async _add(client, auth, fn) {
			var _a;
			debug("adding socket to nsp %s", this.name);
			const socket = await this._createSocket(client, auth);
			this._preConnectSockets.set(socket.id, socket);
			if (((_a = this.server.opts.connectionStateRecovery) === null || _a === void 0 ? void 0 : _a.skipMiddlewares) && socket.recovered && client.conn.readyState === "open") return this._doConnect(socket, fn);
			this.run(socket, (err) => {
				process.nextTick(() => {
					if ("open" !== client.conn.readyState) {
						debug("next called after client was closed - ignoring socket");
						socket._cleanup();
						return;
					}
					if (err) {
						debug("middleware error, sending CONNECT_ERROR packet to the client");
						socket._cleanup();
						if (client.conn.protocol === 3) return socket._error(err.data || err.message);
						else return socket._error({
							message: err.message,
							data: err.data
						});
					}
					this._doConnect(socket, fn);
				});
			});
		}
		async _createSocket(client, auth) {
			const sessionId = auth.pid;
			const offset = auth.offset;
			if (this.server.opts.connectionStateRecovery && typeof sessionId === "string" && typeof offset === "string") {
				let session;
				try {
					session = await this.adapter.restoreSession(sessionId, offset);
				} catch (e) {
					debug("error while restoring session: %s", e);
				}
				if (session) {
					debug("connection state recovered for sid %s", session.sid);
					return new socket_1.Socket(this, client, auth, session);
				}
			}
			return new socket_1.Socket(this, client, auth);
		}
		_doConnect(socket, fn) {
			this._preConnectSockets.delete(socket.id);
			this.sockets.set(socket.id, socket);
			socket._onconnect();
			if (fn) fn(socket);
			this.emitReserved("connect", socket);
			this.emitReserved("connection", socket);
		}
		/**
		* Removes a client. Called by each `Socket`.
		*
		* @private
		*/
		_remove(socket) {
			this.sockets.delete(socket.id) || this._preConnectSockets.delete(socket.id);
		}
		/**
		* Emits to all connected clients.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* myNamespace.emit("hello", "world");
		*
		* // all serializable datastructures are supported (no need to call JSON.stringify)
		* myNamespace.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
		*
		* // with an acknowledgement from the clients
		* myNamespace.timeout(1000).emit("some-event", (err, responses) => {
		*   if (err) {
		*     // some clients did not acknowledge the event in the given delay
		*   } else {
		*     console.log(responses); // one response per client
		*   }
		* });
		*
		* @return Always true
		*/
		emit(ev, ...args) {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).emit(ev, ...args);
		}
		/**
		* Sends a `message` event to all clients.
		*
		* This method mimics the WebSocket.send() method.
		*
		* @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* myNamespace.send("hello");
		*
		* // this is equivalent to
		* myNamespace.emit("message", "hello");
		*
		* @return self
		*/
		send(...args) {
			this.emit("message", ...args);
			return this;
		}
		/**
		* Sends a `message` event to all clients. Sends a `message` event. Alias of {@link send}.
		*
		* @return self
		*/
		write(...args) {
			this.emit("message", ...args);
			return this;
		}
		/**
		* Sends a message to the other Socket.IO servers of the cluster.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* myNamespace.serverSideEmit("hello", "world");
		*
		* myNamespace.on("hello", (arg1) => {
		*   console.log(arg1); // prints "world"
		* });
		*
		* // acknowledgements (without binary content) are supported too:
		* myNamespace.serverSideEmit("ping", (err, responses) => {
		*  if (err) {
		*     // some servers did not acknowledge the event in the given delay
		*   } else {
		*     console.log(responses); // one response per server (except the current one)
		*   }
		* });
		*
		* myNamespace.on("ping", (cb) => {
		*   cb("pong");
		* });
		*
		* @param ev - the event name
		* @param args - an array of arguments, which may include an acknowledgement callback at the end
		*/
		serverSideEmit(ev, ...args) {
			if (exports.RESERVED_EVENTS.has(ev)) throw new Error(`"${String(ev)}" is a reserved event name`);
			args.unshift(ev);
			this.adapter.serverSideEmit(args);
			return true;
		}
		/**
		* Sends a message and expect an acknowledgement from the other Socket.IO servers of the cluster.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* try {
		*   const responses = await myNamespace.serverSideEmitWithAck("ping");
		*   console.log(responses); // one response per server (except the current one)
		* } catch (e) {
		*   // some servers did not acknowledge the event in the given delay
		* }
		*
		* @param ev - the event name
		* @param args - an array of arguments
		*
		* @return a Promise that will be fulfilled when all servers have acknowledged the event
		*/
		serverSideEmitWithAck(ev, ...args) {
			return new Promise((resolve, reject) => {
				args.push((err, responses) => {
					if (err) {
						err.responses = responses;
						return reject(err);
					} else return resolve(responses);
				});
				this.serverSideEmit(ev, ...args);
			});
		}
		/**
		* Called when a packet is received from another Socket.IO server
		*
		* @param args - an array of arguments, which may include an acknowledgement callback at the end
		*
		* @private
		*/
		_onServerSideEmit(args) {
			super.emitUntyped.apply(this, args);
		}
		/**
		* Gets a list of clients.
		*
		* @deprecated this method will be removed in the next major release, please use {@link Namespace#serverSideEmit} or
		* {@link Namespace#fetchSockets} instead.
		*/
		allSockets() {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).allSockets();
		}
		/**
		* Sets the compress flag.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* myNamespace.compress(false).emit("hello");
		*
		* @param compress - if `true`, compresses the sending data
		* @return self
		*/
		compress(compress) {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).compress(compress);
		}
		/**
		* Sets a modifier for a subsequent event emission that the event data may be lost if the client is not ready to
		* receive messages (because of network slowness or other issues, or because they’re connected through long polling
		* and is in the middle of a request-response cycle).
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* myNamespace.volatile.emit("hello"); // the clients may or may not receive it
		*
		* @return self
		*/
		get volatile() {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).volatile;
		}
		/**
		* Sets a modifier for a subsequent event emission that the event data will only be broadcast to the current node.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* // the “foo” event will be broadcast to all connected clients on this node
		* myNamespace.local.emit("foo", "bar");
		*
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		get local() {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).local;
		}
		/**
		* Adds a timeout in milliseconds for the next operation.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* myNamespace.timeout(1000).emit("some-event", (err, responses) => {
		*   if (err) {
		*     // some clients did not acknowledge the event in the given delay
		*   } else {
		*     console.log(responses); // one response per client
		*   }
		* });
		*
		* @param timeout
		*/
		timeout(timeout) {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).timeout(timeout);
		}
		/**
		* Returns the matching socket instances.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* // return all Socket instances
		* const sockets = await myNamespace.fetchSockets();
		*
		* // return all Socket instances in the "room1" room
		* const sockets = await myNamespace.in("room1").fetchSockets();
		*
		* for (const socket of sockets) {
		*   console.log(socket.id);
		*   console.log(socket.handshake);
		*   console.log(socket.rooms);
		*   console.log(socket.data);
		*
		*   socket.emit("hello");
		*   socket.join("room1");
		*   socket.leave("room2");
		*   socket.disconnect();
		* }
		*/
		fetchSockets() {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).fetchSockets();
		}
		/**
		* Makes the matching socket instances join the specified rooms.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* // make all socket instances join the "room1" room
		* myNamespace.socketsJoin("room1");
		*
		* // make all socket instances in the "room1" room join the "room2" and "room3" rooms
		* myNamespace.in("room1").socketsJoin(["room2", "room3"]);
		*
		* @param room - a room, or an array of rooms
		*/
		socketsJoin(room) {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).socketsJoin(room);
		}
		/**
		* Makes the matching socket instances leave the specified rooms.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* // make all socket instances leave the "room1" room
		* myNamespace.socketsLeave("room1");
		*
		* // make all socket instances in the "room1" room leave the "room2" and "room3" rooms
		* myNamespace.in("room1").socketsLeave(["room2", "room3"]);
		*
		* @param room - a room, or an array of rooms
		*/
		socketsLeave(room) {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).socketsLeave(room);
		}
		/**
		* Makes the matching socket instances disconnect.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		* const myNamespace = io.of("/my-namespace");
		*
		* // make all socket instances disconnect (the connections might be kept alive for other namespaces)
		* myNamespace.disconnectSockets();
		*
		* // make all socket instances in the "room1" room disconnect and close the underlying connections
		* myNamespace.in("room1").disconnectSockets(true);
		*
		* @param close - whether to close the underlying connection
		*/
		disconnectSockets(close = false) {
			return new broadcast_operator_1.BroadcastOperator(this.adapter).disconnectSockets(close);
		}
	};
	exports.Namespace = Namespace;
}));
//#endregion
//#region node_modules/socket.io-adapter/dist/contrib/yeast.js
var require_yeast = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encode = encode;
	exports.decode = decode;
	exports.yeast = yeast;
	var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");
	var length = 64;
	var map = {};
	var seed = 0;
	var i = 0;
	var prev;
	/**
	* Return a string representing the specified number.
	*
	* @param {Number} num The number to convert.
	* @returns {String} The string representation of the number.
	* @api public
	*/
	function encode(num) {
		let encoded = "";
		do {
			encoded = alphabet[num % length] + encoded;
			num = Math.floor(num / length);
		} while (num > 0);
		return encoded;
	}
	/**
	* Return the integer value specified by the given string.
	*
	* @param {String} str The string to convert.
	* @returns {Number} The integer value represented by the string.
	* @api public
	*/
	function decode(str) {
		let decoded = 0;
		for (i = 0; i < str.length; i++) decoded = decoded * length + map[str.charAt(i)];
		return decoded;
	}
	/**
	* Yeast: A tiny growing id generator.
	*
	* @returns {String} A unique id.
	* @api public
	*/
	function yeast() {
		const now = encode(+/* @__PURE__ */ new Date());
		if (now !== prev) return seed = 0, prev = now;
		return now + "." + encode(seed++);
	}
	for (; i < length; i++) map[alphabet[i]] = i;
}));
//#endregion
//#region node_modules/socket.io-adapter/dist/in-memory-adapter.js
var require_in_memory_adapter = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _a;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SessionAwareAdapter = exports.Adapter = void 0;
	var events_1$1 = require("events");
	var yeast_1 = require_yeast();
	var WebSocket = require_ws();
	var canPreComputeFrame = typeof ((_a = WebSocket === null || WebSocket === void 0 ? void 0 : WebSocket.Sender) === null || _a === void 0 ? void 0 : _a.frame) === "function";
	var Adapter = class extends events_1$1.EventEmitter {
		/**
		* In-memory adapter constructor.
		*
		* @param nsp
		*/
		constructor(nsp) {
			super();
			this.nsp = nsp;
			this.rooms = /* @__PURE__ */ new Map();
			this.sids = /* @__PURE__ */ new Map();
			this.encoder = nsp.server.encoder;
		}
		/**
		* To be overridden
		*/
		init() {}
		/**
		* To be overridden
		*/
		close() {}
		/**
		* Returns the number of Socket.IO servers in the cluster
		*
		* @public
		*/
		serverCount() {
			return Promise.resolve(1);
		}
		/**
		* Adds a socket to a list of room.
		*
		* @param {SocketId}  id      the socket id
		* @param {Set<Room>} rooms   a set of rooms
		* @public
		*/
		addAll(id, rooms) {
			if (!this.sids.has(id)) this.sids.set(id, /* @__PURE__ */ new Set());
			for (const room of rooms) {
				this.sids.get(id).add(room);
				if (!this.rooms.has(room)) {
					this.rooms.set(room, /* @__PURE__ */ new Set());
					this.emit("create-room", room);
				}
				if (!this.rooms.get(room).has(id)) {
					this.rooms.get(room).add(id);
					this.emit("join-room", room, id);
				}
			}
		}
		/**
		* Removes a socket from a room.
		*
		* @param {SocketId} id     the socket id
		* @param {Room}     room   the room name
		*/
		del(id, room) {
			if (this.sids.has(id)) this.sids.get(id).delete(room);
			this._del(room, id);
		}
		_del(room, id) {
			const _room = this.rooms.get(room);
			if (_room != null) {
				if (_room.delete(id)) this.emit("leave-room", room, id);
				if (_room.size === 0 && this.rooms.delete(room)) this.emit("delete-room", room);
			}
		}
		/**
		* Removes a socket from all rooms it's joined.
		*
		* @param {SocketId} id   the socket id
		*/
		delAll(id) {
			if (!this.sids.has(id)) return;
			for (const room of this.sids.get(id)) this._del(room, id);
			this.sids.delete(id);
		}
		/**
		* Broadcasts a packet.
		*
		* Options:
		*  - `flags` {Object} flags for this packet
		*  - `except` {Array} sids that should be excluded
		*  - `rooms` {Array} list of rooms to broadcast to
		*
		* @param {Object} packet   the packet object
		* @param {Object} opts     the options
		* @public
		*/
		broadcast(packet, opts) {
			const flags = opts.flags || {};
			const packetOpts = {
				preEncoded: true,
				volatile: flags.volatile,
				compress: flags.compress
			};
			packet.nsp = this.nsp.name;
			const encodedPackets = this._encode(packet, packetOpts);
			this.apply(opts, (socket) => {
				if (typeof socket.notifyOutgoingListeners === "function") socket.notifyOutgoingListeners(packet);
				socket.client.writeToEngine(encodedPackets, packetOpts);
			});
		}
		/**
		* Broadcasts a packet and expects multiple acknowledgements.
		*
		* Options:
		*  - `flags` {Object} flags for this packet
		*  - `except` {Array} sids that should be excluded
		*  - `rooms` {Array} list of rooms to broadcast to
		*
		* @param {Object} packet   the packet object
		* @param {Object} opts     the options
		* @param clientCountCallback - the number of clients that received the packet
		* @param ack                 - the callback that will be called for each client response
		*
		* @public
		*/
		broadcastWithAck(packet, opts, clientCountCallback, ack) {
			const flags = opts.flags || {};
			const packetOpts = {
				preEncoded: true,
				volatile: flags.volatile,
				compress: flags.compress
			};
			packet.nsp = this.nsp.name;
			packet.id = this.nsp._ids++;
			const encodedPackets = this._encode(packet, packetOpts);
			let clientCount = 0;
			this.apply(opts, (socket) => {
				clientCount++;
				socket.acks.set(packet.id, ack);
				if (typeof socket.notifyOutgoingListeners === "function") socket.notifyOutgoingListeners(packet);
				socket.client.writeToEngine(encodedPackets, packetOpts);
			});
			clientCountCallback(clientCount);
		}
		_encode(packet, packetOpts) {
			const encodedPackets = this.encoder.encode(packet);
			if (canPreComputeFrame && encodedPackets.length === 1 && typeof encodedPackets[0] === "string") {
				const data = Buffer.from("4" + encodedPackets[0]);
				packetOpts.wsPreEncodedFrame = WebSocket.Sender.frame(data, {
					readOnly: false,
					mask: false,
					rsv1: false,
					opcode: 1,
					fin: true
				});
			}
			return encodedPackets;
		}
		/**
		* Gets a list of sockets by sid.
		*
		* @param {Set<Room>} rooms   the explicit set of rooms to check.
		*/
		sockets(rooms) {
			const sids = /* @__PURE__ */ new Set();
			this.apply({ rooms }, (socket) => {
				sids.add(socket.id);
			});
			return Promise.resolve(sids);
		}
		/**
		* Gets the list of rooms a given socket has joined.
		*
		* @param {SocketId} id   the socket id
		*/
		socketRooms(id) {
			return this.sids.get(id);
		}
		/**
		* Returns the matching socket instances
		*
		* @param opts - the filters to apply
		*/
		fetchSockets(opts) {
			const sockets = [];
			this.apply(opts, (socket) => {
				sockets.push(socket);
			});
			return Promise.resolve(sockets);
		}
		/**
		* Makes the matching socket instances join the specified rooms
		*
		* @param opts - the filters to apply
		* @param rooms - the rooms to join
		*/
		addSockets(opts, rooms) {
			this.apply(opts, (socket) => {
				socket.join(rooms);
			});
		}
		/**
		* Makes the matching socket instances leave the specified rooms
		*
		* @param opts - the filters to apply
		* @param rooms - the rooms to leave
		*/
		delSockets(opts, rooms) {
			this.apply(opts, (socket) => {
				rooms.forEach((room) => socket.leave(room));
			});
		}
		/**
		* Makes the matching socket instances disconnect
		*
		* @param opts - the filters to apply
		* @param close - whether to close the underlying connection
		*/
		disconnectSockets(opts, close) {
			this.apply(opts, (socket) => {
				socket.disconnect(close);
			});
		}
		apply(opts, callback) {
			const rooms = opts.rooms;
			const except = this.computeExceptSids(opts.except);
			if (rooms.size) {
				const ids = /* @__PURE__ */ new Set();
				for (const room of rooms) {
					if (!this.rooms.has(room)) continue;
					for (const id of this.rooms.get(room)) {
						if (ids.has(id) || except.has(id)) continue;
						const socket = this.nsp.sockets.get(id);
						if (socket) {
							callback(socket);
							ids.add(id);
						}
					}
				}
			} else for (const [id] of this.sids) {
				if (except.has(id)) continue;
				const socket = this.nsp.sockets.get(id);
				if (socket) callback(socket);
			}
		}
		computeExceptSids(exceptRooms) {
			const exceptSids = /* @__PURE__ */ new Set();
			if (exceptRooms && exceptRooms.size > 0) {
				for (const room of exceptRooms) if (this.rooms.has(room)) this.rooms.get(room).forEach((sid) => exceptSids.add(sid));
			}
			return exceptSids;
		}
		/**
		* Send a packet to the other Socket.IO servers in the cluster
		* @param packet - an array of arguments, which may include an acknowledgement callback at the end
		*/
		serverSideEmit(packet) {
			console.warn("this adapter does not support the serverSideEmit() functionality");
		}
		/**
		* Save the client session in order to restore it upon reconnection.
		*/
		persistSession(session) {}
		/**
		* Restore the session and find the packets that were missed by the client.
		* @param pid
		* @param offset
		*/
		restoreSession(pid, offset) {
			return null;
		}
	};
	exports.Adapter = Adapter;
	var SessionAwareAdapter = class extends Adapter {
		constructor(nsp) {
			super(nsp);
			this.nsp = nsp;
			this.sessions = /* @__PURE__ */ new Map();
			this.packets = [];
			this.maxDisconnectionDuration = nsp.server.opts.connectionStateRecovery.maxDisconnectionDuration;
			setInterval(() => {
				const threshold = Date.now() - this.maxDisconnectionDuration;
				this.sessions.forEach((session, sessionId) => {
					if (session.disconnectedAt < threshold) this.sessions.delete(sessionId);
				});
				for (let i = this.packets.length - 1; i >= 0; i--) if (this.packets[i].emittedAt < threshold) {
					this.packets.splice(0, i + 1);
					break;
				}
			}, 6e4).unref();
		}
		persistSession(session) {
			session.disconnectedAt = Date.now();
			this.sessions.set(session.pid, session);
		}
		restoreSession(pid, offset) {
			const session = this.sessions.get(pid);
			if (!session) return null;
			if (session.disconnectedAt + this.maxDisconnectionDuration < Date.now()) {
				this.sessions.delete(pid);
				return null;
			}
			const index = this.packets.findIndex((packet) => packet.id === offset);
			if (index === -1) return null;
			const missedPackets = [];
			for (let i = index + 1; i < this.packets.length; i++) {
				const packet = this.packets[i];
				if (shouldIncludePacket(session.rooms, packet.opts)) missedPackets.push(packet.data);
			}
			return Promise.resolve(Object.assign(Object.assign({}, session), { missedPackets }));
		}
		broadcast(packet, opts) {
			var _a;
			const isEventPacket = packet.type === 2;
			const withoutAcknowledgement = packet.id === void 0;
			const notVolatile = ((_a = opts.flags) === null || _a === void 0 ? void 0 : _a.volatile) === void 0;
			if (isEventPacket && withoutAcknowledgement && notVolatile) {
				const id = (0, yeast_1.yeast)();
				packet.data.push(id);
				this.packets.push({
					id,
					opts,
					data: packet.data,
					emittedAt: Date.now()
				});
			}
			super.broadcast(packet, opts);
		}
	};
	exports.SessionAwareAdapter = SessionAwareAdapter;
	function shouldIncludePacket(sessionRooms, opts) {
		const included = opts.rooms.size === 0 || sessionRooms.some((room) => opts.rooms.has(room));
		const notExcluded = sessionRooms.every((room) => !opts.except.has(room));
		return included && notExcluded;
	}
}));
//#endregion
//#region node_modules/socket.io-adapter/dist/cluster-adapter.js
var require_cluster_adapter = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __rest = exports && exports.__rest || function(s, e) {
		var t = {};
		for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
		if (s != null && typeof Object.getOwnPropertySymbols === "function") {
			for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
		}
		return t;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ClusterAdapterWithHeartbeat = exports.ClusterAdapter = exports.MessageType = void 0;
	var in_memory_adapter_1 = require_in_memory_adapter();
	var debug_1 = require_src();
	var crypto_1 = require("crypto");
	var debug = (0, debug_1.debug)("socket.io-adapter");
	var EMITTER_UID = "emitter";
	var DEFAULT_TIMEOUT = 5e3;
	function randomId() {
		return (0, crypto_1.randomBytes)(8).toString("hex");
	}
	var MessageType;
	(function(MessageType) {
		MessageType[MessageType["INITIAL_HEARTBEAT"] = 1] = "INITIAL_HEARTBEAT";
		MessageType[MessageType["HEARTBEAT"] = 2] = "HEARTBEAT";
		MessageType[MessageType["BROADCAST"] = 3] = "BROADCAST";
		MessageType[MessageType["SOCKETS_JOIN"] = 4] = "SOCKETS_JOIN";
		MessageType[MessageType["SOCKETS_LEAVE"] = 5] = "SOCKETS_LEAVE";
		MessageType[MessageType["DISCONNECT_SOCKETS"] = 6] = "DISCONNECT_SOCKETS";
		MessageType[MessageType["FETCH_SOCKETS"] = 7] = "FETCH_SOCKETS";
		MessageType[MessageType["FETCH_SOCKETS_RESPONSE"] = 8] = "FETCH_SOCKETS_RESPONSE";
		MessageType[MessageType["SERVER_SIDE_EMIT"] = 9] = "SERVER_SIDE_EMIT";
		MessageType[MessageType["SERVER_SIDE_EMIT_RESPONSE"] = 10] = "SERVER_SIDE_EMIT_RESPONSE";
		MessageType[MessageType["BROADCAST_CLIENT_COUNT"] = 11] = "BROADCAST_CLIENT_COUNT";
		MessageType[MessageType["BROADCAST_ACK"] = 12] = "BROADCAST_ACK";
		MessageType[MessageType["ADAPTER_CLOSE"] = 13] = "ADAPTER_CLOSE";
	})(MessageType || (exports.MessageType = MessageType = {}));
	function encodeOptions(opts) {
		return {
			rooms: [...opts.rooms],
			except: [...opts.except],
			flags: opts.flags
		};
	}
	function decodeOptions(opts) {
		return {
			rooms: new Set(opts.rooms),
			except: new Set(opts.except),
			flags: opts.flags
		};
	}
	/**
	* A cluster-ready adapter. Any extending class must:
	*
	* - implement {@link ClusterAdapter#doPublish} and {@link ClusterAdapter#doPublishResponse}
	* - call {@link ClusterAdapter#onMessage} and {@link ClusterAdapter#onResponse}
	*/
	var ClusterAdapter = class extends in_memory_adapter_1.Adapter {
		constructor(nsp) {
			super(nsp);
			this.requests = /* @__PURE__ */ new Map();
			this.ackRequests = /* @__PURE__ */ new Map();
			this.uid = randomId();
		}
		/**
		* Called when receiving a message from another member of the cluster.
		*
		* @param message
		* @param offset
		* @protected
		*/
		onMessage(message, offset) {
			if (message.uid === this.uid) return debug("[%s] ignore message from self", this.uid);
			if (message.nsp !== this.nsp.name) return debug("[%s] ignore message from another namespace (%s)", this.uid, message.nsp);
			debug("[%s] new event of type %d from %s", this.uid, message.type, message.uid);
			switch (message.type) {
				case MessageType.BROADCAST:
					if (message.data.requestId !== void 0) super.broadcastWithAck(message.data.packet, decodeOptions(message.data.opts), (clientCount) => {
						debug("[%s] waiting for %d client acknowledgements", this.uid, clientCount);
						this.publishResponse(message.uid, {
							type: MessageType.BROADCAST_CLIENT_COUNT,
							data: {
								requestId: message.data.requestId,
								clientCount
							}
						});
					}, (arg) => {
						debug("[%s] received acknowledgement with value %j", this.uid, arg);
						this.publishResponse(message.uid, {
							type: MessageType.BROADCAST_ACK,
							data: {
								requestId: message.data.requestId,
								packet: arg
							}
						});
					});
					else {
						const packet = message.data.packet;
						const opts = decodeOptions(message.data.opts);
						this.addOffsetIfNecessary(packet, opts, offset);
						super.broadcast(packet, opts);
					}
					break;
				case MessageType.SOCKETS_JOIN:
					super.addSockets(decodeOptions(message.data.opts), message.data.rooms);
					break;
				case MessageType.SOCKETS_LEAVE:
					super.delSockets(decodeOptions(message.data.opts), message.data.rooms);
					break;
				case MessageType.DISCONNECT_SOCKETS:
					super.disconnectSockets(decodeOptions(message.data.opts), message.data.close);
					break;
				case MessageType.FETCH_SOCKETS:
					debug("[%s] calling fetchSockets with opts %j", this.uid, message.data.opts);
					super.fetchSockets(decodeOptions(message.data.opts)).then((localSockets) => {
						this.publishResponse(message.uid, {
							type: MessageType.FETCH_SOCKETS_RESPONSE,
							data: {
								requestId: message.data.requestId,
								sockets: localSockets.map((socket) => {
									const _a = socket.handshake, { sessionStore } = _a, handshake = __rest(_a, ["sessionStore"]);
									return {
										id: socket.id,
										handshake,
										rooms: [...socket.rooms],
										data: socket.data
									};
								})
							}
						});
					});
					break;
				case MessageType.SERVER_SIDE_EMIT: {
					const packet = message.data.packet;
					if (!(message.data.requestId !== void 0)) {
						this.nsp._onServerSideEmit(packet);
						return;
					}
					let called = false;
					const callback = (arg) => {
						if (called) return;
						called = true;
						debug("[%s] calling acknowledgement with %j", this.uid, arg);
						this.publishResponse(message.uid, {
							type: MessageType.SERVER_SIDE_EMIT_RESPONSE,
							data: {
								requestId: message.data.requestId,
								packet: arg
							}
						});
					};
					this.nsp._onServerSideEmit([...packet, callback]);
					break;
				}
				case MessageType.BROADCAST_CLIENT_COUNT:
				case MessageType.BROADCAST_ACK:
				case MessageType.FETCH_SOCKETS_RESPONSE:
				case MessageType.SERVER_SIDE_EMIT_RESPONSE:
					this.onResponse(message);
					break;
				default: debug("[%s] unknown message type: %s", this.uid, message.type);
			}
		}
		/**
		* Called when receiving a response from another member of the cluster.
		*
		* @param response
		* @protected
		*/
		onResponse(response) {
			var _a, _b;
			const requestId = response.data.requestId;
			debug("[%s] received response %s to request %s", this.uid, response.type, requestId);
			switch (response.type) {
				case MessageType.BROADCAST_CLIENT_COUNT:
					(_a = this.ackRequests.get(requestId)) === null || _a === void 0 || _a.clientCountCallback(response.data.clientCount);
					break;
				case MessageType.BROADCAST_ACK:
					(_b = this.ackRequests.get(requestId)) === null || _b === void 0 || _b.ack(response.data.packet);
					break;
				case MessageType.FETCH_SOCKETS_RESPONSE: {
					const request = this.requests.get(requestId);
					if (!request) return;
					request.current++;
					response.data.sockets.forEach((socket) => request.responses.push(socket));
					if (request.current === request.expected) {
						clearTimeout(request.timeout);
						request.resolve(request.responses);
						this.requests.delete(requestId);
					}
					break;
				}
				case MessageType.SERVER_SIDE_EMIT_RESPONSE: {
					const request = this.requests.get(requestId);
					if (!request) return;
					request.current++;
					request.responses.push(response.data.packet);
					if (request.current === request.expected) {
						clearTimeout(request.timeout);
						request.resolve(null, request.responses);
						this.requests.delete(requestId);
					}
					break;
				}
				default: debug("[%s] unknown response type: %s", this.uid, response.type);
			}
		}
		async broadcast(packet, opts) {
			var _a;
			if (!((_a = opts.flags) === null || _a === void 0 ? void 0 : _a.local)) try {
				const offset = await this.publishAndReturnOffset({
					type: MessageType.BROADCAST,
					data: {
						packet,
						opts: encodeOptions(opts)
					}
				});
				this.addOffsetIfNecessary(packet, opts, offset);
			} catch (e) {
				debug("[%s] error while broadcasting message: %s", this.uid, e.message);
			}
			super.broadcast(packet, opts);
		}
		/**
		* Adds an offset at the end of the data array in order to allow the client to receive any missed packets when it
		* reconnects after a temporary disconnection.
		*
		* @param packet
		* @param opts
		* @param offset
		* @private
		*/
		addOffsetIfNecessary(packet, opts, offset) {
			var _a;
			if (!this.nsp.server.opts.connectionStateRecovery) return;
			const isEventPacket = packet.type === 2;
			const withoutAcknowledgement = packet.id === void 0;
			const notVolatile = ((_a = opts.flags) === null || _a === void 0 ? void 0 : _a.volatile) === void 0;
			if (isEventPacket && withoutAcknowledgement && notVolatile) packet.data.push(offset);
		}
		broadcastWithAck(packet, opts, clientCountCallback, ack) {
			var _a;
			if (!((_a = opts === null || opts === void 0 ? void 0 : opts.flags) === null || _a === void 0 ? void 0 : _a.local)) {
				const requestId = randomId();
				this.ackRequests.set(requestId, {
					clientCountCallback,
					ack
				});
				this.publish({
					type: MessageType.BROADCAST,
					data: {
						packet,
						requestId,
						opts: encodeOptions(opts)
					}
				});
				setTimeout(() => {
					this.ackRequests.delete(requestId);
				}, opts.flags.timeout);
			}
			super.broadcastWithAck(packet, opts, clientCountCallback, ack);
		}
		async addSockets(opts, rooms) {
			var _a;
			if (!((_a = opts.flags) === null || _a === void 0 ? void 0 : _a.local)) try {
				await this.publishAndReturnOffset({
					type: MessageType.SOCKETS_JOIN,
					data: {
						opts: encodeOptions(opts),
						rooms
					}
				});
			} catch (e) {
				debug("[%s] error while publishing message: %s", this.uid, e.message);
			}
			super.addSockets(opts, rooms);
		}
		async delSockets(opts, rooms) {
			var _a;
			if (!((_a = opts.flags) === null || _a === void 0 ? void 0 : _a.local)) try {
				await this.publishAndReturnOffset({
					type: MessageType.SOCKETS_LEAVE,
					data: {
						opts: encodeOptions(opts),
						rooms
					}
				});
			} catch (e) {
				debug("[%s] error while publishing message: %s", this.uid, e.message);
			}
			super.delSockets(opts, rooms);
		}
		async disconnectSockets(opts, close) {
			var _a;
			if (!((_a = opts.flags) === null || _a === void 0 ? void 0 : _a.local)) try {
				await this.publishAndReturnOffset({
					type: MessageType.DISCONNECT_SOCKETS,
					data: {
						opts: encodeOptions(opts),
						close
					}
				});
			} catch (e) {
				debug("[%s] error while publishing message: %s", this.uid, e.message);
			}
			super.disconnectSockets(opts, close);
		}
		async fetchSockets(opts) {
			var _a;
			const [localSockets, serverCount] = await Promise.all([super.fetchSockets(opts), this.serverCount()]);
			const expectedResponseCount = serverCount - 1;
			if (((_a = opts.flags) === null || _a === void 0 ? void 0 : _a.local) || expectedResponseCount <= 0) return localSockets;
			const requestId = randomId();
			return new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					const storedRequest = this.requests.get(requestId);
					if (storedRequest) {
						reject(/* @__PURE__ */ new Error(`timeout reached: only ${storedRequest.current} responses received out of ${storedRequest.expected}`));
						this.requests.delete(requestId);
					}
				}, opts.flags.timeout || DEFAULT_TIMEOUT);
				const storedRequest = {
					type: MessageType.FETCH_SOCKETS,
					resolve,
					timeout,
					current: 0,
					expected: expectedResponseCount,
					responses: localSockets
				};
				this.requests.set(requestId, storedRequest);
				this.publish({
					type: MessageType.FETCH_SOCKETS,
					data: {
						opts: encodeOptions(opts),
						requestId
					}
				});
			});
		}
		async serverSideEmit(packet) {
			if (!(typeof packet[packet.length - 1] === "function")) return this.publish({
				type: MessageType.SERVER_SIDE_EMIT,
				data: { packet }
			});
			const ack = packet.pop();
			const expectedResponseCount = await this.serverCount() - 1;
			debug("[%s] waiting for %d responses to \"serverSideEmit\" request", this.uid, expectedResponseCount);
			if (expectedResponseCount <= 0) return ack(null, []);
			const requestId = randomId();
			const timeout = setTimeout(() => {
				const storedRequest = this.requests.get(requestId);
				if (storedRequest) {
					ack(/* @__PURE__ */ new Error(`timeout reached: only ${storedRequest.current} responses received out of ${storedRequest.expected}`), storedRequest.responses);
					this.requests.delete(requestId);
				}
			}, DEFAULT_TIMEOUT);
			const storedRequest = {
				type: MessageType.SERVER_SIDE_EMIT,
				resolve: ack,
				timeout,
				current: 0,
				expected: expectedResponseCount,
				responses: []
			};
			this.requests.set(requestId, storedRequest);
			this.publish({
				type: MessageType.SERVER_SIDE_EMIT,
				data: {
					requestId,
					packet
				}
			});
		}
		publish(message) {
			debug("[%s] sending message %s", this.uid, message.type);
			this.publishAndReturnOffset(message).catch((err) => {
				debug("[%s] error while publishing message: %s", this.uid, err);
			});
		}
		publishAndReturnOffset(message) {
			message.uid = this.uid;
			message.nsp = this.nsp.name;
			return this.doPublish(message);
		}
		publishResponse(requesterUid, response) {
			response.uid = this.uid;
			response.nsp = this.nsp.name;
			debug("[%s] sending response %s to %s", this.uid, response.type, requesterUid);
			this.doPublishResponse(requesterUid, response).catch((err) => {
				debug("[%s] error while publishing response: %s", this.uid, err);
			});
		}
	};
	exports.ClusterAdapter = ClusterAdapter;
	var ClusterAdapterWithHeartbeat = class extends ClusterAdapter {
		constructor(nsp, opts) {
			super(nsp);
			this.nodesMap = /* @__PURE__ */ new Map();
			this.customRequests = /* @__PURE__ */ new Map();
			this._opts = Object.assign({
				heartbeatInterval: 5e3,
				heartbeatTimeout: 1e4
			}, opts);
			this.cleanupTimer = setInterval(() => {
				const now = Date.now();
				this.nodesMap.forEach((lastSeen, uid) => {
					if (now - lastSeen > this._opts.heartbeatTimeout) {
						debug("[%s] node %s seems down", this.uid, uid);
						this.removeNode(uid);
					}
				});
			}, 1e3);
		}
		init() {
			this.publish({ type: MessageType.INITIAL_HEARTBEAT });
		}
		scheduleHeartbeat() {
			if (this.heartbeatTimer) this.heartbeatTimer.refresh();
			else this.heartbeatTimer = setTimeout(() => {
				this.publish({ type: MessageType.HEARTBEAT });
			}, this._opts.heartbeatInterval);
		}
		close() {
			this.publish({ type: MessageType.ADAPTER_CLOSE });
			clearTimeout(this.heartbeatTimer);
			if (this.cleanupTimer) clearInterval(this.cleanupTimer);
		}
		onMessage(message, offset) {
			if (message.uid === this.uid) return debug("[%s] ignore message from self", this.uid);
			if (message.uid && message.uid !== EMITTER_UID) this.nodesMap.set(message.uid, Date.now());
			switch (message.type) {
				case MessageType.INITIAL_HEARTBEAT:
					this.publish({ type: MessageType.HEARTBEAT });
					break;
				case MessageType.HEARTBEAT: break;
				case MessageType.ADAPTER_CLOSE:
					this.removeNode(message.uid);
					break;
				default: super.onMessage(message, offset);
			}
		}
		serverCount() {
			return Promise.resolve(1 + this.nodesMap.size);
		}
		publish(message) {
			this.scheduleHeartbeat();
			return super.publish(message);
		}
		async serverSideEmit(packet) {
			if (!(typeof packet[packet.length - 1] === "function")) return this.publish({
				type: MessageType.SERVER_SIDE_EMIT,
				data: { packet }
			});
			const ack = packet.pop();
			const expectedResponseCount = this.nodesMap.size;
			debug("[%s] waiting for %d responses to \"serverSideEmit\" request", this.uid, expectedResponseCount);
			if (expectedResponseCount <= 0) return ack(null, []);
			const requestId = randomId();
			const timeout = setTimeout(() => {
				const storedRequest = this.customRequests.get(requestId);
				if (storedRequest) {
					ack(/* @__PURE__ */ new Error(`timeout reached: missing ${storedRequest.missingUids.size} responses`), storedRequest.responses);
					this.customRequests.delete(requestId);
				}
			}, DEFAULT_TIMEOUT);
			const storedRequest = {
				type: MessageType.SERVER_SIDE_EMIT,
				resolve: ack,
				timeout,
				missingUids: /* @__PURE__ */ new Set([...this.nodesMap.keys()]),
				responses: []
			};
			this.customRequests.set(requestId, storedRequest);
			this.publish({
				type: MessageType.SERVER_SIDE_EMIT,
				data: {
					requestId,
					packet
				}
			});
		}
		async fetchSockets(opts) {
			var _a;
			const [localSockets, serverCount] = await Promise.all([super.fetchSockets({
				rooms: opts.rooms,
				except: opts.except,
				flags: { local: true }
			}), this.serverCount()]);
			const expectedResponseCount = serverCount - 1;
			if (((_a = opts.flags) === null || _a === void 0 ? void 0 : _a.local) || expectedResponseCount <= 0) return localSockets;
			const requestId = randomId();
			return new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					const storedRequest = this.customRequests.get(requestId);
					if (storedRequest) {
						reject(/* @__PURE__ */ new Error(`timeout reached: missing ${storedRequest.missingUids.size} responses`));
						this.customRequests.delete(requestId);
					}
				}, opts.flags.timeout || DEFAULT_TIMEOUT);
				const storedRequest = {
					type: MessageType.FETCH_SOCKETS,
					resolve,
					timeout,
					missingUids: /* @__PURE__ */ new Set([...this.nodesMap.keys()]),
					responses: localSockets
				};
				this.customRequests.set(requestId, storedRequest);
				this.publish({
					type: MessageType.FETCH_SOCKETS,
					data: {
						opts: encodeOptions(opts),
						requestId
					}
				});
			});
		}
		onResponse(response) {
			const requestId = response.data.requestId;
			debug("[%s] received response %s to request %s", this.uid, response.type, requestId);
			switch (response.type) {
				case MessageType.FETCH_SOCKETS_RESPONSE: {
					const request = this.customRequests.get(requestId);
					if (!request) return;
					response.data.sockets.forEach((socket) => request.responses.push(socket));
					request.missingUids.delete(response.uid);
					if (request.missingUids.size === 0) {
						clearTimeout(request.timeout);
						request.resolve(request.responses);
						this.customRequests.delete(requestId);
					}
					break;
				}
				case MessageType.SERVER_SIDE_EMIT_RESPONSE: {
					const request = this.customRequests.get(requestId);
					if (!request) return;
					request.responses.push(response.data.packet);
					request.missingUids.delete(response.uid);
					if (request.missingUids.size === 0) {
						clearTimeout(request.timeout);
						request.resolve(null, request.responses);
						this.customRequests.delete(requestId);
					}
					break;
				}
				default: super.onResponse(response);
			}
		}
		removeNode(uid) {
			this.customRequests.forEach((request, requestId) => {
				request.missingUids.delete(uid);
				if (request.missingUids.size === 0) {
					clearTimeout(request.timeout);
					if (request.type === MessageType.FETCH_SOCKETS) request.resolve(request.responses);
					else if (request.type === MessageType.SERVER_SIDE_EMIT) request.resolve(null, request.responses);
					this.customRequests.delete(requestId);
				}
			});
			this.nodesMap.delete(uid);
		}
	};
	exports.ClusterAdapterWithHeartbeat = ClusterAdapterWithHeartbeat;
}));
//#endregion
//#region node_modules/socket.io-adapter/dist/index.js
var require_dist$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MessageType = exports.ClusterAdapterWithHeartbeat = exports.ClusterAdapter = exports.SessionAwareAdapter = exports.Adapter = void 0;
	var in_memory_adapter_1 = require_in_memory_adapter();
	Object.defineProperty(exports, "Adapter", {
		enumerable: true,
		get: function() {
			return in_memory_adapter_1.Adapter;
		}
	});
	Object.defineProperty(exports, "SessionAwareAdapter", {
		enumerable: true,
		get: function() {
			return in_memory_adapter_1.SessionAwareAdapter;
		}
	});
	var cluster_adapter_1 = require_cluster_adapter();
	Object.defineProperty(exports, "ClusterAdapter", {
		enumerable: true,
		get: function() {
			return cluster_adapter_1.ClusterAdapter;
		}
	});
	Object.defineProperty(exports, "ClusterAdapterWithHeartbeat", {
		enumerable: true,
		get: function() {
			return cluster_adapter_1.ClusterAdapterWithHeartbeat;
		}
	});
	Object.defineProperty(exports, "MessageType", {
		enumerable: true,
		get: function() {
			return cluster_adapter_1.MessageType;
		}
	});
}));
//#endregion
//#region node_modules/socket.io/dist/parent-namespace.js
var require_parent_namespace = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ParentNamespace = void 0;
	var namespace_1 = require_namespace();
	var socket_io_adapter_1 = require_dist$1();
	var debug = (0, __importDefault(require_src()).default)("socket.io:parent-namespace");
	/**
	* A parent namespace is a special {@link Namespace} that holds a list of child namespaces which were created either
	* with a regular expression or with a function.
	*
	* @example
	* const parentNamespace = io.of(/\/dynamic-\d+/);
	*
	* parentNamespace.on("connection", (socket) => {
	*   const childNamespace = socket.nsp;
	* }
	*
	* // will reach all the clients that are in one of the child namespaces, like "/dynamic-101"
	* parentNamespace.emit("hello", "world");
	*
	*/
	var ParentNamespace = class ParentNamespace extends namespace_1.Namespace {
		constructor(server) {
			super(server, "/_" + ParentNamespace.count++);
			this.children = /* @__PURE__ */ new Set();
		}
		/**
		* @private
		*/
		_initAdapter() {
			this.adapter = new ParentBroadcastAdapter(this);
		}
		emit(ev, ...args) {
			this.children.forEach((nsp) => {
				nsp.emit(ev, ...args);
			});
			return true;
		}
		createChild(name) {
			debug("creating child namespace %s", name);
			const namespace = new namespace_1.Namespace(this.server, name);
			this["_fns"].forEach((fn) => namespace.use(fn));
			this.listeners("connect").forEach((listener) => namespace.on("connect", listener));
			this.listeners("connection").forEach((listener) => namespace.on("connection", listener));
			this.children.add(namespace);
			if (this.server._opts.cleanupEmptyChildNamespaces) {
				const remove = namespace._remove;
				namespace._remove = (socket) => {
					remove.call(namespace, socket);
					if (namespace.sockets.size === 0) {
						debug("closing child namespace %s", name);
						namespace.adapter.close();
						this.server._nsps.delete(namespace.name);
						this.children.delete(namespace);
					}
				};
			}
			this.server._nsps.set(name, namespace);
			this.server.sockets.emitReserved("new_namespace", namespace);
			return namespace;
		}
		fetchSockets() {
			throw new Error("fetchSockets() is not supported on parent namespaces");
		}
	};
	exports.ParentNamespace = ParentNamespace;
	ParentNamespace.count = 0;
	/**
	* A dummy adapter that only supports broadcasting to child (concrete) namespaces.
	* @private file
	*/
	var ParentBroadcastAdapter = class extends socket_io_adapter_1.Adapter {
		broadcast(packet, opts) {
			this.nsp.children.forEach((nsp) => {
				nsp.adapter.broadcast(packet, opts);
			});
		}
	};
}));
//#endregion
//#region node_modules/socket.io/dist/uws.js
var require_uws = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.patchAdapter = patchAdapter;
	exports.restoreAdapter = restoreAdapter;
	exports.serveFile = serveFile;
	var socket_io_adapter_1 = require_dist$1();
	var fs_1$1 = require("fs");
	var debug = (0, __importDefault(require_src()).default)("socket.io:adapter-uws");
	var SEPARATOR = "";
	var { addAll, del, broadcast } = socket_io_adapter_1.Adapter.prototype;
	function patchAdapter(app) {
		socket_io_adapter_1.Adapter.prototype.addAll = function(id, rooms) {
			const isNew = !this.sids.has(id);
			addAll.call(this, id, rooms);
			const socket = this.nsp.sockets.get(id) || this.nsp._preConnectSockets.get(id);
			if (!socket) return;
			if (socket.conn.transport.name === "websocket") {
				subscribe(this.nsp.name, socket, isNew, rooms);
				return;
			}
			if (isNew) socket.conn.on("upgrade", () => {
				const rooms = this.sids.get(id);
				if (rooms) subscribe(this.nsp.name, socket, isNew, rooms);
			});
		};
		socket_io_adapter_1.Adapter.prototype.del = function(id, room) {
			del.call(this, id, room);
			const socket = this.nsp.sockets.get(id) || this.nsp._preConnectSockets.get(id);
			if (socket && socket.conn.transport.name === "websocket") {
				const sessionId = socket.conn.id;
				const websocket = socket.conn.transport.socket;
				const topic = `${this.nsp.name}${SEPARATOR}${room}`;
				debug("unsubscribe connection %s from topic %s", sessionId, topic);
				websocket.unsubscribe(topic);
			}
		};
		socket_io_adapter_1.Adapter.prototype.broadcast = function(packet, opts) {
			if (!(opts.rooms.size <= 1 && opts.except.size === 0)) {
				broadcast.call(this, packet, opts);
				return;
			}
			const flags = opts.flags || {};
			const basePacketOpts = {
				preEncoded: true,
				volatile: flags.volatile,
				compress: flags.compress
			};
			packet.nsp = this.nsp.name;
			const encodedPackets = this.encoder.encode(packet);
			const topic = opts.rooms.size === 0 ? this.nsp.name : `${this.nsp.name}${SEPARATOR}${opts.rooms.keys().next().value}`;
			debug("fast publish to %s", topic);
			encodedPackets.forEach((encodedPacket) => {
				const isBinary = typeof encodedPacket !== "string";
				app.publish(topic, isBinary ? encodedPacket : "4" + encodedPacket, isBinary);
			});
			this.apply(opts, (socket) => {
				if (socket.conn.transport.name !== "websocket") socket.client.writeToEngine(encodedPackets, basePacketOpts);
			});
		};
	}
	function subscribe(namespaceName, socket, isNew, rooms) {
		const sessionId = socket.conn.id;
		const websocket = socket.conn.transport.socket;
		if (isNew) {
			debug("subscribe connection %s to topic %s", sessionId, namespaceName);
			websocket.subscribe(namespaceName);
		}
		rooms.forEach((room) => {
			const topic = `${namespaceName}${SEPARATOR}${room}`;
			debug("subscribe connection %s to topic %s", sessionId, topic);
			websocket.subscribe(topic);
		});
	}
	function restoreAdapter() {
		socket_io_adapter_1.Adapter.prototype.addAll = addAll;
		socket_io_adapter_1.Adapter.prototype.del = del;
		socket_io_adapter_1.Adapter.prototype.broadcast = broadcast;
	}
	var toArrayBuffer = (buffer) => {
		const { buffer: arrayBuffer, byteOffset, byteLength } = buffer;
		return arrayBuffer.slice(byteOffset, byteOffset + byteLength);
	};
	function serveFile(res, filepath) {
		const { size } = (0, fs_1$1.statSync)(filepath);
		const readStream = (0, fs_1$1.createReadStream)(filepath);
		const destroyReadStream = () => !readStream.destroyed && readStream.destroy();
		const onError = (error) => {
			destroyReadStream();
			throw error;
		};
		const onDataChunk = (chunk) => {
			const arrayBufferChunk = toArrayBuffer(chunk);
			res.cork(() => {
				const lastOffset = res.getWriteOffset();
				const [ok, done] = res.tryEnd(arrayBufferChunk, size);
				if (!done && !ok) {
					readStream.pause();
					res.onWritable((offset) => {
						const [ok, done] = res.tryEnd(arrayBufferChunk.slice(offset - lastOffset), size);
						if (!done && ok) readStream.resume();
						return ok;
					});
				}
			});
		};
		res.onAborted(destroyReadStream);
		readStream.on("data", onDataChunk).on("error", onError).on("end", destroyReadStream);
	}
}));
//#endregion
//#region node_modules/socket.io/package.json
var package_exports = /* @__PURE__ */ __exportAll({
	bugs: () => bugs,
	contributors: () => contributors,
	default: () => package_default,
	dependencies: () => dependencies,
	description: () => description,
	directories: () => directories,
	engines: () => engines,
	exports: () => exports$1,
	files: () => files,
	homepage: () => homepage,
	keywords: () => keywords,
	license: () => "MIT",
	main: () => main,
	name: () => name,
	repository: () => repository,
	scripts: () => scripts,
	tsd: () => tsd,
	type: () => type,
	types: () => types,
	version: () => version
}), name, version, description, keywords, files, directories, type, main, exports$1, types, homepage, repository, bugs, scripts, dependencies, contributors, engines, tsd, package_default;
var init_package = __esmMin((() => {
	name = "socket.io";
	version = "4.8.3";
	description = "node.js realtime framework server";
	keywords = [
		"realtime",
		"framework",
		"websocket",
		"tcp",
		"events",
		"socket",
		"io"
	];
	files = [
		"dist/",
		"client-dist/",
		"wrapper.mjs",
		"!**/*.tsbuildinfo"
	];
	directories = {
		"doc": "docs/",
		"example": "example/",
		"lib": "lib/",
		"test": "test/"
	};
	type = "commonjs";
	main = "./dist/index.js";
	exports$1 = {
		".": {
			"types": "./dist/index.d.ts",
			"import": "./wrapper.mjs",
			"require": "./dist/index.js"
		},
		"./package.json": "./package.json"
	};
	types = "./dist/index.d.ts";
	homepage = "https://github.com/socketio/socket.io/tree/main/packages/socket.io#readme";
	repository = {
		"type": "git",
		"url": "git+https://github.com/socketio/socket.io.git"
	};
	bugs = { "url": "https://github.com/socketio/socket.io/issues" };
	scripts = {
		"compile": "rimraf ./dist && tsc",
		"test": "npm run format:check && npm run compile && npm run test:types && npm run test:unit",
		"test:types": "tsd",
		"test:unit": "nyc mocha --import=tsx --reporter spec --slow 200 --bail --timeout 10000 test/index.ts",
		"format:check": "prettier --check \"lib/**/*.ts\" \"test/**/*.ts\"",
		"format:fix": "prettier --write \"lib/**/*.ts\" \"test/**/*.ts\"",
		"prepack": "npm run compile"
	};
	dependencies = {
		"accepts": "~1.3.4",
		"base64id": "~2.0.0",
		"cors": "~2.8.5",
		"debug": "~4.4.1",
		"engine.io": "~6.6.0",
		"socket.io-adapter": "~2.5.2",
		"socket.io-parser": "~4.2.4"
	};
	contributors = [
		{
			"name": "Guillermo Rauch",
			"email": "rauchg@gmail.com"
		},
		{
			"name": "Arnout Kazemier",
			"email": "info@3rd-eden.com"
		},
		{
			"name": "Vladimir Dronnikov",
			"email": "dronnikov@gmail.com"
		},
		{
			"name": "Einar Otto Stangvik",
			"email": "einaros@gmail.com"
		}
	];
	engines = { "node": ">=10.2.0" };
	tsd = { "directory": "test" };
	package_default = {
		name,
		version,
		description,
		keywords,
		files,
		directories,
		type,
		main,
		exports: exports$1,
		types,
		license: "MIT",
		homepage,
		repository,
		bugs,
		scripts,
		dependencies,
		contributors,
		engines,
		tsd
	};
}));
//#endregion
//#region node_modules/socket.io/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Namespace = exports.Socket = exports.Server = void 0;
	var http_1 = __importDefault(require("http"));
	var fs_1 = require("fs");
	var zlib_1 = require("zlib");
	var accepts = require_accepts();
	var stream_1 = require("stream");
	var path$1 = require("path");
	var engine_io_1 = require_engine_io();
	var client_1 = require_client();
	var events_1 = require("events");
	var namespace_1 = require_namespace();
	Object.defineProperty(exports, "Namespace", {
		enumerable: true,
		get: function() {
			return namespace_1.Namespace;
		}
	});
	var parent_namespace_1 = require_parent_namespace();
	var socket_io_adapter_1 = require_dist$1();
	var parser = __importStar(require_cjs());
	var debug_1 = __importDefault(require_src());
	var socket_1 = require_socket();
	Object.defineProperty(exports, "Socket", {
		enumerable: true,
		get: function() {
			return socket_1.Socket;
		}
	});
	var typed_events_1 = require_typed_events();
	var uws_1 = require_uws();
	var cors_1 = __importDefault(require_lib());
	var debug = (0, debug_1.default)("socket.io:server");
	var clientVersion = (init_package(), __toCommonJS(package_exports).default).version;
	var dotMapRegex = /\.map/;
	/**
	* Represents a Socket.IO server.
	*
	* @example
	* import { Server } from "socket.io";
	*
	* const io = new Server();
	*
	* io.on("connection", (socket) => {
	*   console.log(`socket ${socket.id} connected`);
	*
	*   // send an event to the client
	*   socket.emit("foo", "bar");
	*
	*   socket.on("foobar", () => {
	*     // an event was received from the client
	*   });
	*
	*   // upon disconnection
	*   socket.on("disconnect", (reason) => {
	*     console.log(`socket ${socket.id} disconnected due to ${reason}`);
	*   });
	* });
	*
	* io.listen(3000);
	*/
	var Server = class Server extends typed_events_1.StrictEventEmitter {
		constructor(srv, opts = {}) {
			super();
			/**
			* @private
			*/
			this._nsps = /* @__PURE__ */ new Map();
			this.parentNsps = /* @__PURE__ */ new Map();
			/**
			* A subset of the {@link parentNsps} map, only containing {@link ParentNamespace} which are based on a regular
			* expression.
			*
			* @private
			*/
			this.parentNamespacesFromRegExp = /* @__PURE__ */ new Map();
			if ("object" === typeof srv && srv instanceof Object && !srv.listen) {
				opts = srv;
				srv = void 0;
			}
			this.path(opts.path || "/socket.io");
			this.connectTimeout(opts.connectTimeout || 45e3);
			this.serveClient(false !== opts.serveClient);
			this._parser = opts.parser || parser;
			this.encoder = new this._parser.Encoder();
			this.opts = opts;
			if (opts.connectionStateRecovery) {
				opts.connectionStateRecovery = Object.assign({
					maxDisconnectionDuration: 12e4,
					skipMiddlewares: true
				}, opts.connectionStateRecovery);
				this.adapter(opts.adapter || socket_io_adapter_1.SessionAwareAdapter);
			} else this.adapter(opts.adapter || socket_io_adapter_1.Adapter);
			opts.cleanupEmptyChildNamespaces = !!opts.cleanupEmptyChildNamespaces;
			this.sockets = this.of("/");
			if (srv || typeof srv == "number") this.attach(srv);
			if (this.opts.cors) this._corsMiddleware = (0, cors_1.default)(this.opts.cors);
		}
		get _opts() {
			return this.opts;
		}
		serveClient(v) {
			if (!arguments.length) return this._serveClient;
			this._serveClient = v;
			return this;
		}
		/**
		* Executes the middleware for an incoming namespace not already created on the server.
		*
		* @param name - name of incoming namespace
		* @param auth - the auth parameters
		* @param fn - callback
		*
		* @private
		*/
		_checkNamespace(name, auth, fn) {
			if (this.parentNsps.size === 0) return fn(false);
			const keysIterator = this.parentNsps.keys();
			const run = () => {
				const nextFn = keysIterator.next();
				if (nextFn.done) return fn(false);
				nextFn.value(name, auth, (err, allow) => {
					if (err || !allow) return run();
					if (this._nsps.has(name)) {
						debug("dynamic namespace %s already exists", name);
						return fn(this._nsps.get(name));
					}
					const namespace = this.parentNsps.get(nextFn.value).createChild(name);
					debug("dynamic namespace %s was created", name);
					fn(namespace);
				});
			};
			run();
		}
		path(v) {
			if (!arguments.length) return this._path;
			this._path = v.replace(/\/$/, "");
			const escapedPath = this._path.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
			this.clientPathRegex = new RegExp("^" + escapedPath + "/socket\\.io(\\.msgpack|\\.esm)?(\\.min)?\\.js(\\.map)?(?:\\?|$)");
			return this;
		}
		connectTimeout(v) {
			if (v === void 0) return this._connectTimeout;
			this._connectTimeout = v;
			return this;
		}
		adapter(v) {
			if (!arguments.length) return this._adapter;
			this._adapter = v;
			for (const nsp of this._nsps.values()) nsp._initAdapter();
			return this;
		}
		/**
		* Attaches socket.io to a server or port.
		*
		* @param srv - server or port
		* @param opts - options passed to engine.io
		* @return self
		*/
		listen(srv, opts = {}) {
			return this.attach(srv, opts);
		}
		/**
		* Attaches socket.io to a server or port.
		*
		* @param srv - server or port
		* @param opts - options passed to engine.io
		* @return self
		*/
		attach(srv, opts = {}) {
			if ("function" == typeof srv) throw new Error("You are trying to attach socket.io to an express request handler function. Please pass a http.Server instance.");
			if (Number(srv) == srv) srv = Number(srv);
			if ("number" == typeof srv) {
				debug("creating http server and binding to %d", srv);
				const port = srv;
				srv = http_1.default.createServer((req, res) => {
					res.writeHead(404);
					res.end();
				});
				srv.listen(port);
			}
			Object.assign(opts, this.opts);
			opts.path = opts.path || this._path;
			this.initEngine(srv, opts);
			return this;
		}
		/**
		* Attaches socket.io to a uWebSockets.js app.
		* @param app
		* @param opts
		*/
		attachApp(app, opts = {}) {
			Object.assign(opts, this.opts);
			opts.path = opts.path || this._path;
			debug("creating uWebSockets.js-based engine with opts %j", opts);
			const engine = new engine_io_1.uServer(opts);
			engine.attach(app, opts);
			this.bind(engine);
			if (this._serveClient) app.get(`${this._path}/*`, (res, req) => {
				if (!this.clientPathRegex.test(req.getUrl())) {
					req.setYield(true);
					return;
				}
				const filename = req.getUrl().replace(this._path, "").replace(/\?.*$/, "").replace(/^\//, "");
				const isMap = dotMapRegex.test(filename);
				const type = isMap ? "map" : "source";
				const expectedEtag = "\"" + clientVersion + "\"";
				const weakEtag = "W/" + expectedEtag;
				const etag = req.getHeader("if-none-match");
				if (etag) {
					if (expectedEtag === etag || weakEtag === etag) {
						debug("serve client %s 304", type);
						res.writeStatus("304 Not Modified");
						res.end();
						return;
					}
				}
				debug("serve client %s", type);
				res.writeHeader("cache-control", "public, max-age=0");
				res.writeHeader("content-type", "application/" + (isMap ? "json" : "javascript") + "; charset=utf-8");
				res.writeHeader("etag", expectedEtag);
				const filepath = path$1.join(__dirname, "../client-dist/", filename);
				(0, uws_1.serveFile)(res, filepath);
			});
			(0, uws_1.patchAdapter)(app);
		}
		/**
		* Initialize engine
		*
		* @param srv - the server to attach to
		* @param opts - options passed to engine.io
		* @private
		*/
		initEngine(srv, opts) {
			debug("creating engine.io instance with opts %j", opts);
			this.eio = (0, engine_io_1.attach)(srv, opts);
			if (this._serveClient) this.attachServe(srv);
			this.httpServer = srv;
			this.bind(this.eio);
		}
		/**
		* Attaches the static file serving.
		*
		* @param srv http server
		* @private
		*/
		attachServe(srv) {
			debug("attaching client serving req handler");
			const evs = srv.listeners("request").slice(0);
			srv.removeAllListeners("request");
			srv.on("request", (req, res) => {
				if (this.clientPathRegex.test(req.url)) {
					if (this._corsMiddleware) this._corsMiddleware(req, res, () => {
						this.serve(req, res);
					});
					else this.serve(req, res);
				} else for (let i = 0; i < evs.length; i++) evs[i].call(srv, req, res);
			});
		}
		/**
		* Handles a request serving of client source and map
		*
		* @param req
		* @param res
		* @private
		*/
		serve(req, res) {
			const filename = req.url.replace(this._path, "").replace(/\?.*$/, "");
			const isMap = dotMapRegex.test(filename);
			const type = isMap ? "map" : "source";
			const expectedEtag = "\"" + clientVersion + "\"";
			const weakEtag = "W/" + expectedEtag;
			const etag = req.headers["if-none-match"];
			if (etag) {
				if (expectedEtag === etag || weakEtag === etag) {
					debug("serve client %s 304", type);
					res.writeHead(304);
					res.end();
					return;
				}
			}
			debug("serve client %s", type);
			res.setHeader("Cache-Control", "public, max-age=0");
			res.setHeader("Content-Type", "application/" + (isMap ? "json" : "javascript") + "; charset=utf-8");
			res.setHeader("ETag", expectedEtag);
			Server.sendFile(filename, req, res);
		}
		/**
		* @param filename
		* @param req
		* @param res
		* @private
		*/
		static sendFile(filename, req, res) {
			const readStream = (0, fs_1.createReadStream)(path$1.join(__dirname, "../client-dist/", filename));
			const encoding = accepts(req).encodings([
				"br",
				"gzip",
				"deflate"
			]);
			const onError = (err) => {
				if (err) res.end();
			};
			switch (encoding) {
				case "br":
					res.writeHead(200, { "content-encoding": "br" });
					(0, stream_1.pipeline)(readStream, (0, zlib_1.createBrotliCompress)(), res, onError);
					break;
				case "gzip":
					res.writeHead(200, { "content-encoding": "gzip" });
					(0, stream_1.pipeline)(readStream, (0, zlib_1.createGzip)(), res, onError);
					break;
				case "deflate":
					res.writeHead(200, { "content-encoding": "deflate" });
					(0, stream_1.pipeline)(readStream, (0, zlib_1.createDeflate)(), res, onError);
					break;
				default:
					res.writeHead(200);
					(0, stream_1.pipeline)(readStream, res, onError);
			}
		}
		/**
		* Binds socket.io to an engine.io instance.
		*
		* @param engine engine.io (or compatible) server
		* @return self
		*/
		bind(engine) {
			this.engine = engine;
			this.engine.on("connection", this.onconnection.bind(this));
			return this;
		}
		/**
		* Called with each incoming transport connection.
		*
		* @param {engine.Socket} conn
		* @return self
		* @private
		*/
		onconnection(conn) {
			debug("incoming connection with id %s", conn.id);
			const client = new client_1.Client(this, conn);
			if (conn.protocol === 3) client.connect("/");
			return this;
		}
		/**
		* Looks up a namespace.
		*
		* @example
		* // with a simple string
		* const myNamespace = io.of("/my-namespace");
		*
		* // with a regex
		* const dynamicNsp = io.of(/^\/dynamic-\d+$/).on("connection", (socket) => {
		*   const namespace = socket.nsp; // newNamespace.name === "/dynamic-101"
		*
		*   // broadcast to all clients in the given sub-namespace
		*   namespace.emit("hello");
		* });
		*
		* @param name - nsp name
		* @param fn optional, nsp `connection` ev handler
		*/
		of(name, fn) {
			if (typeof name === "function" || name instanceof RegExp) {
				const parentNsp = new parent_namespace_1.ParentNamespace(this);
				debug("initializing parent namespace %s", parentNsp.name);
				if (typeof name === "function") this.parentNsps.set(name, parentNsp);
				else {
					this.parentNsps.set((nsp, conn, next) => next(null, name.test(nsp)), parentNsp);
					this.parentNamespacesFromRegExp.set(name, parentNsp);
				}
				if (fn) parentNsp.on("connect", fn);
				return parentNsp;
			}
			if (String(name)[0] !== "/") name = "/" + name;
			let nsp = this._nsps.get(name);
			if (!nsp) {
				for (const [regex, parentNamespace] of this.parentNamespacesFromRegExp) if (regex.test(name)) {
					debug("attaching namespace %s to parent namespace %s", name, regex);
					return parentNamespace.createChild(name);
				}
				debug("initializing namespace %s", name);
				nsp = new namespace_1.Namespace(this, name);
				this._nsps.set(name, nsp);
				if (name !== "/") this.sockets.emitReserved("new_namespace", nsp);
			}
			if (fn) nsp.on("connect", fn);
			return nsp;
		}
		/**
		* Closes server connection
		*
		* @param [fn] optional, called as `fn([err])` on error OR all conns closed
		*/
		async close(fn) {
			await Promise.allSettled([...this._nsps.values()].map(async (nsp) => {
				nsp.sockets.forEach((socket) => {
					socket._onclose("server shutting down");
				});
				await nsp.adapter.close();
			}));
			this.engine.close();
			(0, uws_1.restoreAdapter)();
			if (this.httpServer) return new Promise((resolve) => {
				this.httpServer.close((err) => {
					fn && fn(err);
					if (err) debug("server was not running");
					resolve();
				});
			});
			else fn && fn();
		}
		/**
		* Registers a middleware, which is a function that gets executed for every incoming {@link Socket}.
		*
		* @example
		* io.use((socket, next) => {
		*   // ...
		*   next();
		* });
		*
		* @param fn - the middleware function
		*/
		use(fn) {
			this.sockets.use(fn);
			return this;
		}
		/**
		* Targets a room when emitting.
		*
		* @example
		* // the “foo” event will be broadcast to all connected clients in the “room-101” room
		* io.to("room-101").emit("foo", "bar");
		*
		* // with an array of rooms (a client will be notified at most once)
		* io.to(["room-101", "room-102"]).emit("foo", "bar");
		*
		* // with multiple chained calls
		* io.to("room-101").to("room-102").emit("foo", "bar");
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		to(room) {
			return this.sockets.to(room);
		}
		/**
		* Targets a room when emitting. Similar to `to()`, but might feel clearer in some cases:
		*
		* @example
		* // disconnect all clients in the "room-101" room
		* io.in("room-101").disconnectSockets();
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		in(room) {
			return this.sockets.in(room);
		}
		/**
		* Excludes a room when emitting.
		*
		* @example
		* // the "foo" event will be broadcast to all connected clients, except the ones that are in the "room-101" room
		* io.except("room-101").emit("foo", "bar");
		*
		* // with an array of rooms
		* io.except(["room-101", "room-102"]).emit("foo", "bar");
		*
		* // with multiple chained calls
		* io.except("room-101").except("room-102").emit("foo", "bar");
		*
		* @param room - a room, or an array of rooms
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		except(room) {
			return this.sockets.except(room);
		}
		/**
		* Sends a `message` event to all clients.
		*
		* This method mimics the WebSocket.send() method.
		*
		* @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
		*
		* @example
		* io.send("hello");
		*
		* // this is equivalent to
		* io.emit("message", "hello");
		*
		* @return self
		*/
		send(...args) {
			this.sockets.emit("message", ...args);
			return this;
		}
		/**
		* Sends a `message` event to all clients. Alias of {@link send}.
		*
		* @return self
		*/
		write(...args) {
			this.sockets.emit("message", ...args);
			return this;
		}
		/**
		* Sends a message to the other Socket.IO servers of the cluster.
		*
		* @example
		* io.serverSideEmit("hello", "world");
		*
		* io.on("hello", (arg1) => {
		*   console.log(arg1); // prints "world"
		* });
		*
		* // acknowledgements (without binary content) are supported too:
		* io.serverSideEmit("ping", (err, responses) => {
		*  if (err) {
		*     // some servers did not acknowledge the event in the given delay
		*   } else {
		*     console.log(responses); // one response per server (except the current one)
		*   }
		* });
		*
		* io.on("ping", (cb) => {
		*   cb("pong");
		* });
		*
		* @param ev - the event name
		* @param args - an array of arguments, which may include an acknowledgement callback at the end
		*/
		serverSideEmit(ev, ...args) {
			return this.sockets.serverSideEmit(ev, ...args);
		}
		/**
		* Sends a message and expect an acknowledgement from the other Socket.IO servers of the cluster.
		*
		* @example
		* try {
		*   const responses = await io.serverSideEmitWithAck("ping");
		*   console.log(responses); // one response per server (except the current one)
		* } catch (e) {
		*   // some servers did not acknowledge the event in the given delay
		* }
		*
		* @param ev - the event name
		* @param args - an array of arguments
		*
		* @return a Promise that will be fulfilled when all servers have acknowledged the event
		*/
		serverSideEmitWithAck(ev, ...args) {
			return this.sockets.serverSideEmitWithAck(ev, ...args);
		}
		/**
		* Gets a list of socket ids.
		*
		* @deprecated this method will be removed in the next major release, please use {@link Server#serverSideEmit} or
		* {@link Server#fetchSockets} instead.
		*/
		allSockets() {
			return this.sockets.allSockets();
		}
		/**
		* Sets the compress flag.
		*
		* @example
		* io.compress(false).emit("hello");
		*
		* @param compress - if `true`, compresses the sending data
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		compress(compress) {
			return this.sockets.compress(compress);
		}
		/**
		* Sets a modifier for a subsequent event emission that the event data may be lost if the client is not ready to
		* receive messages (because of network slowness or other issues, or because they’re connected through long polling
		* and is in the middle of a request-response cycle).
		*
		* @example
		* io.volatile.emit("hello"); // the clients may or may not receive it
		*
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		get volatile() {
			return this.sockets.volatile;
		}
		/**
		* Sets a modifier for a subsequent event emission that the event data will only be broadcast to the current node.
		*
		* @example
		* // the “foo” event will be broadcast to all connected clients on this node
		* io.local.emit("foo", "bar");
		*
		* @return a new {@link BroadcastOperator} instance for chaining
		*/
		get local() {
			return this.sockets.local;
		}
		/**
		* Adds a timeout in milliseconds for the next operation.
		*
		* @example
		* io.timeout(1000).emit("some-event", (err, responses) => {
		*   if (err) {
		*     // some clients did not acknowledge the event in the given delay
		*   } else {
		*     console.log(responses); // one response per client
		*   }
		* });
		*
		* @param timeout
		*/
		timeout(timeout) {
			return this.sockets.timeout(timeout);
		}
		/**
		* Returns the matching socket instances.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		* // return all Socket instances
		* const sockets = await io.fetchSockets();
		*
		* // return all Socket instances in the "room1" room
		* const sockets = await io.in("room1").fetchSockets();
		*
		* for (const socket of sockets) {
		*   console.log(socket.id);
		*   console.log(socket.handshake);
		*   console.log(socket.rooms);
		*   console.log(socket.data);
		*
		*   socket.emit("hello");
		*   socket.join("room1");
		*   socket.leave("room2");
		*   socket.disconnect();
		* }
		*/
		fetchSockets() {
			return this.sockets.fetchSockets();
		}
		/**
		* Makes the matching socket instances join the specified rooms.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		*
		* // make all socket instances join the "room1" room
		* io.socketsJoin("room1");
		*
		* // make all socket instances in the "room1" room join the "room2" and "room3" rooms
		* io.in("room1").socketsJoin(["room2", "room3"]);
		*
		* @param room - a room, or an array of rooms
		*/
		socketsJoin(room) {
			return this.sockets.socketsJoin(room);
		}
		/**
		* Makes the matching socket instances leave the specified rooms.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		* // make all socket instances leave the "room1" room
		* io.socketsLeave("room1");
		*
		* // make all socket instances in the "room1" room leave the "room2" and "room3" rooms
		* io.in("room1").socketsLeave(["room2", "room3"]);
		*
		* @param room - a room, or an array of rooms
		*/
		socketsLeave(room) {
			return this.sockets.socketsLeave(room);
		}
		/**
		* Makes the matching socket instances disconnect.
		*
		* Note: this method also works within a cluster of multiple Socket.IO servers, with a compatible {@link Adapter}.
		*
		* @example
		* // make all socket instances disconnect (the connections might be kept alive for other namespaces)
		* io.disconnectSockets();
		*
		* // make all socket instances in the "room1" room disconnect and close the underlying connections
		* io.in("room1").disconnectSockets(true);
		*
		* @param close - whether to close the underlying connection
		*/
		disconnectSockets(close = false) {
			return this.sockets.disconnectSockets(close);
		}
	};
	exports.Server = Server;
	Object.keys(events_1.EventEmitter.prototype).filter(function(key) {
		return typeof events_1.EventEmitter.prototype[key] === "function";
	}).forEach(function(fn) {
		Server.prototype[fn] = function() {
			return this.sockets[fn].apply(this.sockets, arguments);
		};
	});
	module.exports = (srv, opts) => new Server(srv, opts);
	module.exports.Server = Server;
	module.exports.Namespace = namespace_1.Namespace;
	module.exports.Socket = socket_1.Socket;
}));
//#endregion
//#region ../src/util/opener.ts
var opener_exports = /* @__PURE__ */ __exportAll({ default: () => opener });
function opener(args, tool) {
	let platform = process.platform;
	args = [].concat(args);
	if (platform === "linux" && node_os.default.release().toLowerCase().indexOf("microsoft") !== -1) platform = "win32";
	let command;
	switch (platform) {
		case "win32":
			command = "cmd.exe";
			if (tool) args.unshift(tool);
			break;
		case "darwin":
			command = "open";
			if (tool) {
				args.unshift(tool);
				args.unshift("-a");
			}
			break;
		default: command = tool || "xdg-open";
	}
	if (platform === "win32") {
		args = args.map((value) => {
			return value.replace(/&/g, "^&");
		});
		args = [
			"/c",
			"start",
			"\"\""
		].concat(args);
	}
	return node_child_process.default.spawn(command, args, {
		shell: false,
		detached: true
	});
}
var init_opener = __esmMin((() => {}));
//#endregion
//#region ../src/util/getIP.ts
var getIP_exports = /* @__PURE__ */ __exportAll({ getIP: () => getIP });
function getIP() {
	const interfaces = node_os.default.networkInterfaces();
	let IP = "";
	Object.keys(interfaces).some((devName) => {
		const iface = interfaces[devName] || [];
		for (const alias of iface) if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
			IP = alias.address;
			return true;
		}
		return false;
	});
	return IP;
}
var init_getIP = __esmMin((() => {}));
//#endregion
//#region routes.js
var require_routes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require("node:fs");
	var path = require("node:path");
	var logger = (init_logger(), __toCommonJS(logger_exports)).default("app/routes");
	var APP_DIR = path.resolve(process.env.MKDP_APP_DIR || __dirname);
	var OUT_DIR = path.join(APP_DIR, "out");
	var routes = [];
	var contentTypes = {
		".avif": "image/avif",
		".css": "text/css; charset=utf-8",
		".gif": "image/gif",
		".html": "text/html; charset=utf-8",
		".ico": "image/x-icon",
		".jpeg": "image/jpeg",
		".jpg": "image/jpeg",
		".js": "text/javascript; charset=utf-8",
		".json": "application/json; charset=utf-8",
		".map": "application/json; charset=utf-8",
		".mjs": "text/javascript; charset=utf-8",
		".png": "image/png",
		".svg": "image/svg+xml",
		".ttf": "font/ttf",
		".wasm": "application/wasm",
		".webp": "image/webp",
		".woff": "font/woff",
		".woff2": "font/woff2"
	};
	var isFile = (filePath) => {
		try {
			return fs.statSync(filePath).isFile();
		} catch {
			return false;
		}
	};
	var resolveWithin = (root, requestPath) => {
		try {
			const rootPath = path.resolve(root);
			const filePath = path.resolve(rootPath, `.${decodeURIComponent(requestPath)}`);
			const relativePath = path.relative(rootPath, filePath);
			if (relativePath === "" || relativePath === ".." || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) return null;
			return filePath;
		} catch {
			return null;
		}
	};
	var sendFile = (res, filePath) => {
		const contentType = contentTypes[path.extname(filePath).toLowerCase()];
		if (contentType) res.setHeader("content-type", contentType);
		const stream = fs.createReadStream(filePath);
		stream.once("error", (error) => {
			logger.error("Failed to serve file:", filePath, error);
			if (res.headersSent) res.destroy(error);
			else {
				res.statusCode = 404;
				res.end();
			}
		});
		return stream.pipe(res);
	};
	var serveStatic = (root, prefix) => {
		return (req, res, next) => {
			if (!req.asPath.startsWith(prefix)) return next();
			const filePath = resolveWithin(root, req.asPath);
			if (!filePath || !isFile(filePath)) {
				logger.warn("Static file not found:", req.asPath);
				return next();
			}
			return sendFile(res, filePath);
		};
	};
	var use = (route) => {
		routes.unshift((req, res, next) => () => route(req, res, next));
	};
	use((req, res, next) => {
		if (/^\/page\/\d+$/.test(req.asPath)) return sendFile(res, path.join(OUT_DIR, "index.html"));
		return next();
	});
	use(serveStatic(OUT_DIR, "/assets/"));
	use((req, res, next) => {
		try {
			if (req.mkcss && req.asPath === "/_static/markdown.css" && isFile(req.mkcss)) return sendFile(res, req.mkcss);
			if (req.hicss && req.asPath === "/_static/highlight.css" && isFile(req.hicss)) return sendFile(res, req.hicss);
		} catch (error) {
			logger.error("Failed to load custom CSS:", req.asPath, error);
		}
		return next();
	});
	use(serveStatic(APP_DIR, "/_static/"));
	use(async (req, res, next) => {
		logger.info("image route: ", req.asPath);
		if (!req.asPath.startsWith("/_local_image_")) return next();
		const plugin = req.plugin;
		if (!(await plugin.nvim.buffers).find((item) => item.id === Number(req.bufnr))) return next();
		let fileDir = req.custImgPath;
		if (fileDir === "") fileDir = await plugin.nvim.call("expand", `#${req.bufnr}:p:h`);
		if (process.env.MINGW_HOME && !fileDir.includes(":")) {
			const { execSync } = require("node:child_process");
			fileDir = execSync(`cygpath.exe -w -a ${fileDir}`).toString("utf8").trim();
		}
		let imagePath;
		try {
			imagePath = decodeURIComponent(decodeURIComponent(req.asPath.slice(14)));
		} catch (error) {
			logger.error("Failed to decode image path:", req.asPath, error);
			return next();
		}
		imagePath = imagePath.replace(/\\ /g, " ");
		if (imagePath[0] !== "/" && imagePath[0] !== "\\") imagePath = path.join(fileDir, imagePath);
		else if (!fs.existsSync(imagePath)) {
			let parentDir = fileDir;
			while (parentDir !== "/" && parentDir !== "\\") {
				parentDir = path.normalize(path.join(parentDir, ".."));
				const candidatePath = path.join(parentDir, imagePath);
				if (fs.existsSync(candidatePath)) {
					imagePath = candidatePath;
					break;
				}
			}
		}
		if (isFile(imagePath)) return sendFile(res, imagePath);
		logger.error("Image not found:", imagePath);
		return next();
	});
	use((req, res) => {
		res.statusCode = 404;
		return sendFile(res, path.join(OUT_DIR, "404.html"));
	});
	module.exports = (req, res, next) => {
		return routes.reduce((handler, route) => route(req, res, handler), next)();
	};
}));
//#endregion
//#region server.js
exports.run = function() {
	const { plugin } = require_nvim();
	const http = require("http");
	const websocket = require_dist();
	const opener = (init_opener(), __toCommonJS(opener_exports)).default;
	const logger = (init_logger(), __toCommonJS(logger_exports)).default("app/server");
	const { getIP } = (init_getIP(), __toCommonJS(getIP_exports));
	const routes = require_routes();
	let clients = {};
	const openUrl = (url, browser) => {
		opener(url, browser).on("error", (err) => {
			const match = (err.message || "").match(/\s*spawn\s+(.+)\s+ENOENT\s*/);
			if (match) plugin.nvim.call("mkdp#util#echo_messages", ["Error", [`[markdown-preview.nvim]: Can not open browser by using ${match[1]} command`]]);
			else plugin.nvim.call("mkdp#util#echo_messages", ["Error", [err.name, err.message]]);
		});
	};
	const update_clients_active_var = () => {
		if (Object.values(clients).some((cs) => cs.some((c) => c.connected))) plugin.nvim.setVar("mkdp_clients_active", 1);
		else plugin.nvim.setVar("mkdp_clients_active", 0);
	};
	const server = http.createServer(async (req, res) => {
		req.plugin = plugin;
		req.bufnr = (req.headers.referer || req.url).replace(/[?#].*$/, "").split("/").pop();
		req.asPath = req.url.replace(/[?#].*$/, "");
		req.mkcss = await plugin.nvim.getVar("mkdp_markdown_css");
		req.hicss = await plugin.nvim.getVar("mkdp_highlight_css");
		req.custImgPath = await plugin.nvim.getVar("mkdp_images_path");
		routes(req, res);
	});
	websocket(server).on("connection", async (client) => {
		const { handshake = { query: {} } } = client;
		const bufnr = handshake.query.bufnr;
		logger.info("client connect: ", client.id, bufnr);
		clients[bufnr] = clients[bufnr] || [];
		clients[bufnr].push(client);
		update_clients_active_var();
		(await plugin.nvim.buffers).forEach(async (buffer) => {
			if (buffer.id === Number(bufnr)) {
				const winline = await plugin.nvim.call("winline");
				const currentWindow = await plugin.nvim.window;
				const winheight = await plugin.nvim.call("winheight", currentWindow.id);
				const cursor = await plugin.nvim.call("getpos", ".");
				const options = await plugin.nvim.getVar("mkdp_preview_options");
				const pageTitle = await plugin.nvim.getVar("mkdp_page_title");
				const theme = await plugin.nvim.getVar("mkdp_theme");
				const name = await buffer.name;
				const content = await buffer.getLines();
				const currentBuffer = await plugin.nvim.buffer;
				client.emit("refresh_content", {
					options,
					isActive: currentBuffer.id === buffer.id,
					winline,
					winheight,
					cursor,
					pageTitle,
					theme,
					name,
					content
				});
			}
		});
		client.on("disconnect", function() {
			logger.info("disconnect: ", client.id);
			clients[bufnr] = (clients[bufnr] || []).map((c) => c.id !== client.id);
			update_clients_active_var();
		});
	});
	async function startServer() {
		const openToTheWord = await plugin.nvim.getVar("mkdp_open_to_the_world");
		const host = openToTheWord ? "0.0.0.0" : "127.0.0.1";
		let port = await plugin.nvim.getVar("mkdp_port");
		port = port || 8080 + Number(`${Date.now()}`.slice(-3));
		server.listen({
			host,
			port
		}, function() {
			logger.info("server run: ", port);
			function refreshPage({ bufnr, data }) {
				logger.info("refresh page: ", bufnr);
				(clients[bufnr] || []).forEach((c) => {
					if (c.connected) c.emit("refresh_content", data);
				});
			}
			function closePage({ bufnr }) {
				logger.info("close page: ", bufnr);
				clients[bufnr] = (clients[bufnr] || []).filter((c) => {
					if (c.connected) {
						c.emit("close_page");
						return false;
					}
					return true;
				});
			}
			function closeAllPages() {
				logger.info("close all pages");
				Object.keys(clients).forEach((bufnr) => {
					(clients[bufnr] || []).forEach((c) => {
						if (c.connected) c.emit("close_page");
					});
				});
				clients = {};
			}
			async function openBrowser({ bufnr }) {
				if (await plugin.nvim.getVar("mkdp_combine_preview") && Object.values(clients).some((cs) => cs.some((c) => c.connected))) {
					logger.info(`combine preview page: `, bufnr);
					Object.values(clients).forEach((cs) => {
						cs.forEach((c) => {
							if (c.connected) c.emit("change_bufnr", bufnr);
						});
					});
				} else {
					const openIp = await plugin.nvim.getVar("mkdp_open_ip");
					const url = `http://${openIp !== "" ? openIp : openToTheWord ? getIP() : "localhost"}:${port}/page/${bufnr}`;
					const browserfunc = await plugin.nvim.getVar("mkdp_browserfunc");
					if (browserfunc !== "") {
						logger.info(`open page [${browserfunc}]: `, url);
						plugin.nvim.call(browserfunc, [url]);
					} else {
						const browser = await plugin.nvim.getVar("mkdp_browser");
						logger.info(`open page [${browser || "default"}]: `, url);
						if (browser !== "") openUrl(url, browser);
						else openUrl(url);
					}
					if (await plugin.nvim.getVar("mkdp_echo_preview_url")) plugin.nvim.call("mkdp#util#echo_url", [url]);
				}
			}
			plugin.init({
				refreshPage,
				closePage,
				closeAllPages,
				openBrowser
			});
			plugin.nvim.call("mkdp#util#open_browser");
		});
	}
	startServer();
};
//#endregion
