import CryptoJS from "crypto-js";
import { Platform } from "react-native";

export async function useAvatarUpload(uri: string, userId: string): Promise<string> {
	const config = {
		cloud_name: "dq8jvjcv4",
		api_key: "668727717621116",
		api_secret: "xpCfuSucQ3IeK_B2fOf7TJFry2I",
	};

	const publicId = `user_${userId}`;
	const folder = "avatars";
	const timestamp = Math.floor(Date.now() / 1000);

	const toSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${config.api_secret}`;
	const signature = CryptoJS.SHA1(toSign).toString();

	const data = new FormData();

	if (Platform.OS === "web" && uri.startsWith("blob:")) {
		const res = await fetch(uri);
		const blob = await res.blob();
		data.append("file", blob, `avatar_${userId}.png`);
	} else {
		data.append("file", {
			uri,
			type: "image/jpeg",
			name: `avatar_${userId}.jpg`,
		} as any);
	}

	data.append("public_id", publicId);
	data.append("folder", folder);
	data.append("timestamp", timestamp.toString());
	data.append("api_key", config.api_key);
	data.append("signature", signature);

	const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloud_name}/image/upload`, {
		method: "POST",
		body: data,
	});

	const json = await res.json();
	console.log("Cloudinary response:", json);

	return `${json.secure_url}?t=${Date.now()}`;
}
