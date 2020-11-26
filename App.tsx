import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import mime from 'mime';
import { Camera } from 'expo-camera';
import { Entypo, Ionicons } from '@expo/vector-icons';
import api from './api';

declare global {
    interface FormDataValue {
        uri: string;
        name: string;
        type: string;
    }

    interface FormData {
        append(name: string, value: FormDataValue, fileName?: string): void;
        set(name: string, value: FormDataValue, fileName?: string): void;
    }
}

export default function App() {
    const myCamera = useRef<Camera>(null);
    const [hasPermission, setHasPermission] = useState<any>(null);
    const [colors, setColors] = useState<Array<string>>([]);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handlePicture = async () => {
        if (myCamera) {
            const picture = await myCamera.current!.takePictureAsync();

            const imageUri = 'file:///' + picture.uri.split('file:/').join('');

            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                name: 'image.jpg',
                type: 'image/jpg',
            });

            try {
                const response = await api.post('/image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log(response.data);
                setColors(response.data);
            } catch (error) {
                console.log(error);
            }
        }
    };

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={{ flex: 1 }}>
            <Camera style={{ flex: 1 }} ratio="16:9" ref={myCamera}>
                <View style={styles.contentContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handlePicture}
                    >
                        <Entypo name="camera" size={24} color="#707070" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => console.log(colors)}
                    >
                        <Ionicons
                            name="ios-color-palette"
                            size={26}
                            color="#707070"
                        />
                    </TouchableOpacity>
                </View>
            </Camera>
        </View>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: '10%',
        backgroundColor: 'transparent',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },

    button: {
        padding: '5%',
        borderRadius: 50,
        backgroundColor: 'white',
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
});
