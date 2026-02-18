import { View, Text } from 'react-native';

export default function TestScreen() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black' }}>
            <Text style={{ color: 'white' }}>Navigation Context Test: SUCCESS</Text>
        </View>
    );
}
