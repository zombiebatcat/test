class Cookie {
	constructor() {
		(this.defaults = {
			path: "/",
			secure: location.protocol === "https:",
		}),
			(this.expiresMultiplier = 60 * 60 * 24),
			(this.replaceCallback = (str) => {
				return encodeURIComponent(str);
			});
	}

	/**
	 * Encodes the given value by replacing special characters with their corresponding
	 * URI-encoded values.
	 *
	 * @param {*} value - The value to be encoded.
	 * @returns {string} - The encoded value.
	 */
	encode(value) {
		return String(value).replace(/[,;"\\=\s%]/g, this.replaceCallback);
	}
	/**
	 * Decodes the given URI-encoded value by replacing each escape sequence with its corresponding
	 * character.
	 *
	 * @param {string} value - The URI-encoded value to be decoded.
	 * @returns {*} - The decoded value.
	 */
	decode(value) {
		return decodeURIComponent(value);
	}

	/**
	 * Retrieves a given value, or returns a fallback if the value is null or undefined.
	 *
	 * @param {*} value - The value to be retrieved.
	 * @param {*} fallback - The fallback value to be returned if the given value is null or undefined.
	 * @returns {*} - The retrieved value, or the fallback value.
	 */
	retrieve(value, fallback) {
		return value == null ? fallback : value;
	}

	/**
	 * Sets a cookie with the given key and value, using the specified options.
	 *
	 * @param {string} key - The key to be used for the cookie.
	 * @param {*} value - The value to be stored in the cookie.
	 * @param {Object} [options] - An object containing additional options for the cookie.
	 * @returns {Cookie} - This Cookie instance, for method chaining.
	 */
	set(key, value, options) {
		if (key instanceof Object) {
			for (let k in key) {
				if (key.hasOwnProperty(k)) this.set(k, key[k], value);
			}
		} else {
			options =
				options instanceof Object ? options : { expires: options };
			let expires =
					options.expires !== undefined
						? options.expires
						: this.defaults.expires || "",
				expiresType = typeof expires;

			if (expiresType === "string" && expires !== "")
				expires = new Date(expires);
			else if (expiresType === "number")
				expires = new Date(
					+new Date() + 1000 * this.expiresMultiplier * expires,
				);
			if (expires !== "" && "toUTCString" in expires)
				expires = `;expires=` + expires.toUTCString();

			let path = options.path || this.defaults.path;
			path = path ? `;path=` + path : "";

			let domain = options.domain || this.defaults.domain;
			domain = domain ? `;domain=` + domain : "";

			let secure =
				options.secure || this.defaults.secure ? `;secure` : "";
			if (options.secure === false) secure = "";

			let sameSite = options.sameSite || this.defaults.sameSite;
			sameSite = sameSite ? `;SameSite=` + sameSite : "";
			if (options.sameSite === null) sameSite = "";
			document.cookie =
				this.encode(key) +
				"=" +
				this.encode(value) +
				expires +
				path +
				domain +
				secure +
				sameSite;
		}

		return this;
	}
	/**
	 * Sets a default cookie with the given key and value, if it doesn't already exist.
	 *
	 * @param {string} key - The key to be used for the cookie.
	 * @param {*} value - The value to be stored in the cookie.
	 * @param {Object} [options] - An object containing additional options for the cookie.
	 * @returns {Cookie} - This Cookie instance, for method chaining.
	 */
	setDefault(key, value, options) {
		if (key instanceof Object) {
			for (let k in key) {
				if (this.get(k) === undefined) this.set(k, key[k], value);
			}
			return cookie;
		} else {
			if (this.get(key) === undefined)
				return this.set.apply(this, arguments);
		}
	}
	/**
	 * Removes cookies with the given keys.
	 *
	 * @param {...string} keys - The keys of the cookies to be removed.
	 * @returns {Cookie} - This Cookie instance, for method chaining.
	 */
	remove(keys) {
		keys =
			keys instanceof Array
				? keys
				: Array.prototype.slice.call(arguments);
		for (let i = 0, l = keys.length; i < l; i++) this.set(keys[i], "", -1);
		return this;
	}

	/**
	 * Removes cookies with the given keys and options.
	 *
	 * @param {string[]} keys - The keys of the cookies to be removed.
	 * @param {Object} [options] - An object containing additional options for removing the cookie.
	 * @returns {Cookie} - This Cookie instance, for method chaining.
	 */
	removeSpecific(keys, options) {
		if (!options) return this.remove(keys);

		keys = keys instanceof Array ? keys : [keys];
		options.expires = -1;

		for (let i = 0, l = keys.length; i < l; i++) {
			this.set(keys[i], "", options);
		}

		return this; // Return the `cookie` object to make chaining possible.
	}

	/**
	 * Removes all cookies that have been set using this instance of the Cookie class.
	 *
	 * @returns {Cookie} - This Cookie instance, for method chaining.
	 */
	empty() {
		return this.remove(Object.keys(this.all()));
	}

	/**
	 * Retrieves the value of a cookie with the given key, or returns a fallback if the cookie is not found.
	 *
	 * @param {string|string[]} keys - The key(s) to be used for retrieving the cookie value(s).
	 * @param {*} [fallback] - The fallback value to be returned if the cookie is not found.
	 * @returns {*} - The retrieved value, or the fallback value.
	 */
	get(keys, fallback) {
		let cookies = this.all();

		if (keys instanceof Array) {
			let result = {};

			for (let i = 0, l = keys.length; i < l; i++) {
				let value = keys[i];
				result[value] = this.retrieve(cookies[value], fallback);
			}

			return result;
		} else return this.retrieve(cookies[keys], fallback);
	}

	/**
	 * Retrieves all cookies as an object, where each key-value pair corresponds to a cookie.
	 *
	 * @returns {Object} - An object containing all the cookies.
	 */
	all() {
		if (document.cookie === "") return {};

		let cookies = document.cookie.split("; "),
			result = {};

		for (let i = 0, l = cookies.length; i < l; i++) {
			let item = cookies[i].split("=");
			let key = this.decode(item.shift());
			let value = this.decode(item.join("="));
			result[key] = value;
		}
		return result;
	}

	/**
	 * Checks whether cookies are enabled in the current browser.
	 *
	 * @returns {boolean} - `true` if cookies are enabled, `false` otherwise.
	 */
	enabled() {
		if (navigator.cookieEnabled) return true;

		let ret = cookie.set("_", "_").get("_") === "_";
		cookie.remove("_");
		return ret;
	}
}

export default Cookie;
