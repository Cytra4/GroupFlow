//Custom input

import { hp, wp } from '@/scripts/constants';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { KeyboardTypeOptions, StyleSheet, TextInput, View } from 'react-native';

type InputProps = {
	placeholder?: string,
	onChange?: (text: string) => void,
	keyboardType?: KeyboardTypeOptions,
	boxStyle?: {},
	textStyle?: {},
	iconStyle?: {},
	iconName?: React.ComponentProps<typeof Feather>['name'],
	iconColor?: string,
	iconSize?: number,
	secureText?: boolean,
}

export default function CustomInput({
	placeholder,
	onChange,
	keyboardType = "default",
	boxStyle = {},
	textStyle = {},
	iconStyle = {},
	iconName,
	iconColor = "black",
	iconSize = 24,
	secureText = false,
}: InputProps) {
	return (
		<View style={[styles.container, boxStyle]}>
			{/* Right now the icon can only use Feather cause I suck at coding :/ */}
			{iconName && (
				<Feather
					style={[styles.icon, iconStyle]}
					name={iconName}
					size={iconSize}
					color={iconColor}
				/>
			)}
			<TextInput
				placeholder={placeholder}
				placeholderTextColor={"#939393"}
				style={[styles.text, textStyle]}
				onChangeText={onChange}
				keyboardType={keyboardType}
				secureTextEntry={secureText}
				autoCorrect = {false}
  				autoCapitalize = "none"
  				returnKeyType = "done"
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 2,
		borderRadius: 15,
		height: hp(6.5),
		width: wp(80),
		paddingRight: 12
	},
	icon: {
		paddingLeft: 12,
		paddingRight: 8,
	},
	text: {
		flex: 1,
		fontSize: 20,
		fontWeight: "bold",
	}
})
