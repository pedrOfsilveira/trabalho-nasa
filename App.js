import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Alert,
  Pressable,
  Animated,
} from 'react-native';
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'W95FA': require('./assets/fonts/W95FA.otf'),
  });

  const [dadosNasa, setDadosNasa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataPesquisa, setDataPesquisa] = useState('');

  const interferenceAnim = useRef(new Animated.Value(0)).current;

  const triggerInterference = () => {
    interferenceAnim.setValue(0);
    Animated.sequence([
      Animated.timing(interferenceAnim, { toValue: 5, duration: 40, useNativeDriver: true }),
      Animated.timing(interferenceAnim, { toValue: -5, duration: 40, useNativeDriver: true }),
      Animated.timing(interferenceAnim, { toValue: 3, duration: 40, useNativeDriver: true }),
      Animated.timing(interferenceAnim, { toValue: -3, duration: 40, useNativeDriver: true }),
      Animated.timing(interferenceAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const buscarDados = async (data = '') => {
    if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      Alert.alert("Formato Inválido", "Por favor, insira a data no formato AAAA-MM-DD.");
      return;
    }
    try {
      setLoading(true);
      setDadosNasa(null);
      let url = `https://api.nasa.gov/planetary/apod?api_key=Ti1NgOOrssHpbVBsxokMgWdttIw6WLaF1BWgSZ2m`;
      if (data) {
        url += `&date=${data}`;
      }
      const response = await fetch(url);
      const responseData = await response.json();
      if (responseData.code === 404 || responseData.code === 400) {
        Alert.alert("Sem Resultados", responseData.msg || "Não foi encontrada uma imagem para esta data. Tente outra.");
      } else {
        setDadosNasa(responseData);
      }
    } catch (error) {
      console.error("Erro ao buscar dados da NASA:", error);
      Alert.alert("Erro de Rede", "Não foi possível conectar à API da NASA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.desktopPattern}>
        <View style={styles.window}>
          <View style={styles.titleBar}>
            <View style={styles.titleSection}>
              <Image source={require('./assets/images/console_prompt-0.png')} style={styles.iconImage} />
              <Text style={styles.titleBarText}>NASA APOD Explorer 98</Text>
            </View>
            <View style={styles.windowControls}>
              <View style={styles.controlButton}>
                <Text style={styles.controlText}>_</Text>
              </View>
              <View style={styles.controlButton}>
                <Text style={styles.controlText}>□</Text>
              </View>
              <View style={styles.controlButtonClose}>
                <Text style={styles.controlTextClose}>×</Text>
              </View>
            </View>
          </View>

          <View style={styles.menuBar}>
            <Text style={styles.menuItem}>Arquivo</Text>
            <Text style={styles.menuItem}>Visualizar</Text>
            <Text style={styles.menuItem}>Ferramentas</Text>
            <Text style={styles.menuItem}>Ajuda</Text>
          </View>

          <View style={styles.windowBody}>
            <View style={styles.searchPanel}>
              <Text style={styles.searchLabel}>Buscar por Data:</Text>
              <View style={styles.searchRow}>
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput98}
                    placeholder="AAAA-MM-DD"
                    value={dataPesquisa}
                    onChangeText={setDataPesquisa}
                    placeholderTextColor="#808080"
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>
                <Pressable
                  onPress={() => {
                    triggerInterference();
                    buscarDados(dataPesquisa);
                  }}
                  style={({ pressed }) => [
                    styles.button98,
                    styles.searchButton,
                    pressed ? styles.button98Pressed : styles.button98Released,
                  ]}
                >
                  <Text style={styles.button98Text}>Buscar</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.contentArea}>
              <View style={styles.sunkenPanel}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000080" />
                    <Text style={styles.loadingText}>Carregando dados da NASA...</Text>
                  </View>
                ) : (
                  dadosNasa && (
                    <ScrollView
                      style={styles.scrollContent}
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                    >
                      <View style={styles.imageHeader}>
                        <Text style={styles.imageTitle}>{dadosNasa.title}</Text>
                        <View style={styles.dateContainer}>
                          <Image source={require('./assets/images/calendar-0.png')} style={styles.dateIcon} />
                          <Text style={styles.dateText}>{dadosNasa.date}</Text>
                        </View>
                      </View>

                      {dadosNasa.media_type === 'image' ? (
                        <View style={styles.imageContainer}>
                          <Image
                            source={{ uri: dadosNasa.url }}
                            style={styles.image}
                            resizeMode="contain"
                          />
                        </View>
                      ) : (
                        <View style={styles.videoContainer}>
                          <Image source={require('./assets/images/multimedia-2.png')} style={styles.videoIconImage} />
                          <Text style={styles.videoText}>O conteúdo para esta data é um vídeo.</Text>
                        </View>
                      )}

                      <View style={styles.explanationPanel}>
                        <Text style={styles.explanationTitle}>Descrição:</Text>
                        <Text style={styles.explanation}>{dadosNasa.explanation}</Text>
                      </View>
                    </ScrollView>
                  )
                )}
              </View>
            </View>

            <View style={styles.bottomPanel}>
              <Pressable
                onPress={() => {
                  triggerInterference();
                  setDataPesquisa('');
                  buscarDados();
                }}
                style={({ pressed }) => [
                  styles.button98,
                  styles.todayButton,
                  pressed ? styles.button98Pressed : styles.button98Released,
                ]}
              >
                <View style={styles.buttonContentContainer}>
                  <Image source={require('./assets/images/channels-3.png')} style={styles.buttonIcon} />
                  <Text style={styles.button98Text}>Imagem de Hoje</Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View style={styles.statusBar}>
            <View style={styles.statusBox}><Text style={styles.statusText}>Pedro e Isa - 4C</Text></View>
            <View style={styles.statusBox}><Text style={styles.statusText}>NASA APOD v1.0</Text></View>
          </View>
        </View>
      </View>

      <Animated.View
        style={[
          styles.crtOverlay,
          {
            transform: [{ translateX: interferenceAnim }]
          }
        ]}
      >
        <Image
          source={require('./assets/images/crt-overlay3.jpg')}
          style={styles.crtImage}
          resizeMode="stretch"
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const win98 = {
  silver: '#c0c0c0',
  blue: '#000080',
  white: '#ffffff',
  shadow: '#808080',
  darkShadow: '#404040',
  black: '#000000',
  teal: '#008080',
};

const styles = StyleSheet.create({
  crtOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.12,
    pointerEvents: 'none',
  },
  crtImage: {
    width: '100%',
    height: '100%',
  },

  container: {
    flex: 1,
    backgroundColor: win98.teal,
  },
  titleBarText: {
    color: win98.white,
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'W95FA',
  },
  menuItem: {
    marginRight: 12,
    fontSize: 12,
    color: win98.black,
    fontFamily: 'W95FA',
  },
  searchLabel: {
    fontSize: 12,
    marginBottom: 5,
    color: win98.black,
    fontFamily: 'W95FA',
  },
  textInput98: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 0,
    fontSize: 13,
    color: win98.black,
    textAlignVertical: 'center',
    fontFamily: 'W95FA',
  },
  button98Text: {
    fontSize: 12,
    color: win98.black,
    fontFamily: 'W95FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: win98.blue,
    fontFamily: 'W95FA',
  },
  imageTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
    color: win98.blue,
    fontFamily: 'W95FA',
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'W95FA',
  },
  videoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'W95FA',
  },
  explanationTitle: {
    fontSize: 13,
    marginBottom: 6,
    color: win98.blue,
    fontFamily: 'W95FA',
  },
  explanation: {
    fontSize: 13,
    lineHeight: 18,
    color: win98.black,
    fontFamily: 'W95FA',
  },
  statusText: {
    fontSize: 11,
    color: win98.black,
    fontFamily: 'W95FA',
  },
  desktopPattern: {
    flex: 1,
    padding: 10,
    paddingTop: 30,
  },
  window: {
    flex: 1,
    backgroundColor: win98.silver,
    borderWidth: 2,
    borderTopColor: win98.white,
    borderLeftColor: win98.white,
    borderRightColor: win98.darkShadow,
    borderBottomColor: win98.darkShadow,
    padding: 2,
  },
  titleBar: {
    backgroundColor: win98.blue,
    paddingVertical: 3,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconImage: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  windowControls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 20,
    height: 18,
    backgroundColor: win98.silver,
    borderWidth: 1,
    borderTopColor: win98.white,
    borderLeftColor: win98.white,
    borderRightColor: win98.darkShadow,
    borderBottomColor: win98.darkShadow,
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonClose: {
    width: 20,
    height: 18,
    backgroundColor: win98.silver,
    borderWidth: 1,
    borderTopColor: win98.white,
    borderLeftColor: win98.white,
    borderRightColor: win98.darkShadow,
    borderBottomColor: win98.darkShadow,
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 12,
    color: win98.black,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 14,
  },
  controlTextClose: {
    fontSize: 14,
    color: win98.black,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 14,
  },
  menuBar: {
    backgroundColor: win98.silver,
    paddingVertical: 3,
    paddingHorizontal: 6,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: win98.shadow,
  },
  windowBody: {
    flex: 1,
    padding: 8,
    backgroundColor: win98.silver,
  },
  searchPanel: {
    backgroundColor: win98.silver,
    padding: 8,
    paddingTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderTopColor: win98.shadow,
    borderLeftColor: win98.shadow,
    borderRightColor: win98.white,
    borderBottomColor: win98.white,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    height: 32,
    marginRight: 8,
    borderWidth: 2,
    backgroundColor: win98.white,
    borderTopColor: win98.darkShadow,
    borderLeftColor: win98.darkShadow,
    borderRightColor: win98.white,
    borderBottomColor: win98.white,
  },
  searchButton: {
    paddingHorizontal: 12,
    height: 32,
  },
  contentArea: {
    flex: 1,
    marginBottom: 8,
  },
  sunkenPanel: {
    flex: 1,
    backgroundColor: win98.silver,
    borderWidth: 2,
    borderTopColor: win98.shadow,
    borderLeftColor: win98.shadow,
    borderRightColor: win98.white,
    borderBottomColor: win98.white,
    padding: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: win98.white,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: win98.white,
    padding: 8,
  },
  imageHeader: {
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: win98.silver,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    width: 12,
    height: 12,
    marginRight: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 250,
  },
  videoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: win98.silver,
    marginBottom: 12,
  },
  videoIconImage: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  explanationPanel: {
    padding: 10,
    marginBottom: 8,
  },
  bottomPanel: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button98: {
    backgroundColor: win98.silver,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button98Released: {
    borderTopColor: win98.white,
    borderLeftColor: win98.white,
    borderRightColor: win98.darkShadow,
    borderBottomColor: win98.darkShadow,
  },
  button98Pressed: {
    borderTopColor: win98.darkShadow,
    borderLeftColor: win98.darkShadow,
    borderRightColor: win98.white,
    borderBottomColor: win98.white,
  },
  todayButton: {
    paddingHorizontal: 20,
    height: 32,
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderTopWidth: 1,
    borderTopColor: win98.white,
  },
  statusBox: {
    borderWidth: 1,
    borderTopColor: win98.shadow,
    borderLeftColor: win98.shadow,
    borderRightColor: win98.white,
    borderBottomColor: win98.white,
    paddingHorizontal: 6,
  },
});