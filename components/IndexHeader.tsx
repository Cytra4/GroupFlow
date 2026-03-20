import Feather from "@expo/vector-icons/Feather";
import { useRouter } from 'expo-router';
import JoinGroup from "./JoinGroup";

export default function IndexHeader() {
    const router = useRouter();

    return (
        <>
            <JoinGroup />
            <Feather
                name="settings"
                size={24}
                style={{ marginRight: 16 }}
                onPress={() => { router.push('/settings'); }}
            />
        </>
    );
}
