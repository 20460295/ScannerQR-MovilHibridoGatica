import React, { useState, useEffect, useCallback } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';

import { connectDatabase, DatabaseHandler } from '../src/database';
import { CodeRecord } from '../src/models';
import { saveCode, fetchAllCodes } from '../src/webservice';

const ScannerScreen = () => {
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [cameraDirection, setCameraDirection] = useState<CameraType>('back');
    const [cameraPermissions, requestCameraPermission] = useCameraPermissions();
    const [codeRecords, setCodeRecords] = useState<CodeRecord[]>([]);
    const [database, setDatabase] = useState<DatabaseHandler>();

    // Manejo de códigos escaneados
    const handleScanResult = useCallback(async (scanData: BarcodeScanningResult) => {
        Alert.alert('Código detectado', scanData.data);
        
        await saveCode({ 
            content: scanData.data, 
            format: scanData.type 
        });
        
        const updatedRecords = await fetchAllCodes();
        setCodeRecords(updatedRecords);
    }, []);

    // Configuración inicial
    useEffect(() => {
        let active = true;

        const setupLocationService = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (!active) return;

            if (status !== 'granted') {
                setLocationError('Permiso de ubicación no otorgado');
                return;
            }

            const position = await Location.getCurrentPositionAsync();
            if (active) setCurrentLocation(position);
        };

        const initializeDatabase = async () => {
            const dbInstance = await connectDatabase();
            setDatabase(dbInstance);
        };

        setupLocationService();
        initializeDatabase();

        return () => { active = false; };
    }, []);

    // Actualizar registros al cargar la base de datos
    useEffect(() => {
        if (!database) return;

        (async () => {
            const records = await fetchAllCodes();
            setCodeRecords(records);
        })();

        return () => database.closeConnection();
    }, [database]);

    // Verificación de permisos de cámara
    if (!cameraPermissions) return <View />;

    if (!cameraPermissions.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    Se requiere acceso a la cámara
                </Text>
                <TouchableOpacity 
                    style={styles.permissionButton}
                    onPress={requestCameraPermission}
                >
                    <Text style={styles.buttonText}>Habilitar Cámara</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const locationStatus = locationError 
        ? `Error: ${locationError}` 
        : currentLocation 
            ? `Ubicación: ${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`
            : 'Obteniendo ubicación...';

    const CodeListItem = ({ item }: { item: CodeRecord }) => {
        const copyToClipboard = () => {
            Clipboard.setStringAsync(item.content);
            Alert.alert('Copiado!', 'Texto en portapapeles');
        };

        return (
            <View style={styles.codeItem}>
                <Text style={styles.codeContent}>{item.content}</Text>
                <Text style={styles.codeType}>{item.format}</Text>
                <TouchableOpacity 
                    style={styles.copyButton} 
                    onPress={copyToClipboard}
                >
                    <Text style={styles.copyText}>Copiar</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.locationStatus}>{locationStatus}</Text>
            
            <CameraView
                style={styles.scanner}
                facing={cameraDirection}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'code128', 'datamatrix', 'aztec', 'ean13'],
                }}
                onBarcodeScanned={handleScanResult}
            />
            
            <View style={styles.listContainer}>
                <Text style={styles.listTitle}>Registros Escaneados</Text>
                <FlatList
                    data={codeRecords}
                    keyExtractor={item => item.id || String(Math.random() * 10000)}
                    renderItem={CodeListItem}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f7'
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    permissionText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center'
    },
    permissionButton: {
        backgroundColor: '#4285f4',
        padding: 15,
        borderRadius: 8
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    locationStatus: {
        padding: 12,
        backgroundColor: '#e3f2fd',
        textAlign: 'center',
        fontSize: 14
    },
    scanner: {
        height: 300,
        margin: 15,
        borderRadius: 12,
        overflow: 'hidden'
    },
    listContainer: {
        flex: 1,
        padding: 10
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        paddingLeft: 5
    },
    listContent: {
        paddingBottom: 20
    },
    codeItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2
    },
    codeContent: {
        fontSize: 16,
        marginBottom: 5
    },
    codeType: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 10
    },
    copyButton: {
        alignSelf: 'flex-end',
        padding: 8,
        backgroundColor: '#e8f0fe',
        borderRadius: 4
    },
    copyText: {
        color: '#1a73e8',
        fontWeight: '500'
    }
});

export default ScannerScreen;

//juan pablo gatica santana
//No.control 20460295
