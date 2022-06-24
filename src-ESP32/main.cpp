#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <FirebaseESP32.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

//==========================================================
// CONFIGURACION DE LA RED WIFI Y FIREBASE
//==========================================================

#define DEVICE_UID "Sensor"    //ID del dispositivo en Firebase

WiFiMulti wifiMulti;  

//#define WIFI_SSID "WiFIEB"                                                   // RED WIFI
//#define WIFI_PASSWORD ""                                                   // CONTRASEÑA DE LA RED WIFI

#define API_KEY "AIzaSyAntF7CI-kyL-QlPB_Qt2F58DxlzJBbcso"                           // API KEY DE FIREBASE
#define DATABASE_URL "https://medidoragua-22d31-default-rtdb.firebaseio.com/"       // URL DE FIREBASE

String device_location = "Sensor";                                                  // Ubicacion del dispositivo en Firebase
FirebaseData fbdo;                  
FirebaseAuth auth;                 
FirebaseConfig config;           
String databasePath = ""; 
String fuid = ""; 
bool isAuthenticated = false;


//==========================================================





//==========================================================
// VARIABLES PARA EL MEDIDOR DE AGUA
//==========================================================

const int trigPin = 5;
const int echoPin = 18;
int NivelAguaDisplay;

#define V_Sonido 0.034

//==========================================================




//==========================================================
// INICIALIZADOR DE LA BASE DE DATOS FIREBASE
//==========================================================

void FireBase() 
{
    pinMode(2, OUTPUT);
    config.api_key = API_KEY;
    
    config.database_url = DATABASE_URL;
    
    Firebase.reconnectWiFi(true);
    Serial.println("------------------------------------");
    Serial.println("Cargando Base de datos...");
   
    if (Firebase.signUp(&config, &auth, "", ""))
    {
        Serial.println("Entrando...");
        isAuthenticated = true;
        
        databasePath = "/" + device_location;
        fuid = auth.token.uid.c_str();
    }
    else
    {
        Serial.printf("Error, %s\n", config.signer.signupError.message.c_str());
        isAuthenticated = false;
    }
    
    config.token_status_callback = tokenStatusCallback;
    
    Firebase.begin(&config, &auth);
}

//==========================================================





//==========================================================
// CALCULAR EL NIVEL DE AGUA
//==========================================================

float CalcularAgua(int pinTrigger, int pinEcho) 
{
    long Duracion_Echo;
    float NivelAgua;
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    Duracion_Echo = pulseIn(echoPin, HIGH);

    NivelAgua = Duracion_Echo * V_Sonido/2;
    
    return NivelAgua;
}

//==========================================================



float moda(){

    
    int moda = 0;
    int moda_aux;
    int valor, valor2;

    for (int i = 0; i < 5; i++)
    {
        moda_aux = CalcularAgua(trigPin, echoPin);
        //valor = moda_aux;
        //valor = valor/10;
        //valor = valor - 22;
        //valor = 20 - valor;
        //valor2 = 5 *valor -104;
        //Serial.println("Valor: " + String(valor2));

        if (moda_aux > moda)
        {
            moda = moda_aux;
            //Serial.println("Moda: " + String(moda));
        }
    }

    NivelAguaDisplay = moda;

    return NivelAguaDisplay;
}




//==========================================================
// SETUP WIFI, SENSOR Y FIREBASE
//==========================================================

void setup() 

{ 
    wifiMulti.addAP("RavenWiFi_2.4G", "SNKF505808");
    wifiMulti.addAP("WiFIEA", "");
    wifiMulti.addAP("WIFIEA", "");
    wifiMulti.addAP("WiFIEB", "");
    wifiMulti.addAP("WiFIE", "");
    wifiMulti.addAP("WIFIFIE", "");
    wifiMulti.addAP("Wifi_FIE_5Gh", "");
    wifiMulti.addAP("Wifi_FIE_5Ghz", "");

    Serial.begin(9600);

    pinMode(trigPin, OUTPUT);
    pinMode(echoPin, INPUT);

    //WiFi.begin (WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) 
    {
      delay(300);
      Serial.print(".");
      
      if(wifiMulti.run() == WL_CONNECTED) {
        Serial.println("");
        Serial.println("Conectado a:");
        Serial.println(WiFi.SSID());
        }
    }
    
    /*
    while (WiFi.status() != WL_CONNECTED) 
    {
      delay(500);
      Serial.print(".");
    }
    */
    Serial.println("");
    Serial.println("WiFi Conectado");
    Serial.println(WiFi.localIP());
    digitalWrite(2, HIGH);
    FireBase();
}


//==========================================================





//==========================================================
// LOOP
//==========================================================

void loop() 
{  

    float distancia = moda();
    //float distancia = CalcularAgua(trigPin, echoPin);
    distancia = distancia/10;
    distancia = distancia - 22;
    distancia = 20 - distancia;
    NivelAguaDisplay = 5 *distancia -100;

    int DistanciaAgua = 5 * distancia;

    

    //------ RECONECTAR AL WIFI SI NO HAY CONEXIÓN -----
    if (WiFi.status() != WL_CONNECTED) 
    {
        digitalWrite(2, LOW);
        Serial.println("WiFi Desconectado");
        while (WiFi.status() != WL_CONNECTED) 
        {
            delay(500);
            Serial.print(".");
            if(wifiMulti.run() == WL_CONNECTED) {
                Serial.println("");
                Serial.println("Conectado a:");
                Serial.println(WiFi.SSID());
            }
        }
        Serial.println("");
        Serial.println("WiFi Conectado");
        Serial.println(WiFi.localIP());
        digitalWrite(2, HIGH);
        FireBase();
    }
    //--------------------------------------------

    String node = "/Nivel de Agua";

    //------ NIVEL DE AGUA ENTRE 0% Y 100% -----
    if (NivelAguaDisplay > 0 && NivelAguaDisplay <= 100)
    {
      Serial.print("Nivel de Agua: ");
      Serial.print(NivelAguaDisplay);
      Serial.println(" %");
      //Serial.println(DistanciaAgua);
  
          if (Firebase.set(fbdo, node.c_str(), NivelAguaDisplay))
          {
              Serial.print("Firebase: ");
              printResult(fbdo);
              Serial.println(" ");    
          }
    }
    //--------------------------------------------


    //------ NIVEL DE AGUA MENOR A 0 (VACIO) -----
    if (NivelAguaDisplay < 0)
    {
      Serial.println("Nivel de Agua: 0 %");
      int NivelFB = 0;

          if (Firebase.set(fbdo, node.c_str(), NivelFB))
          {
              Serial.print("Firebase: ");
              printResult(fbdo);
              Serial.println(" ");    
          }
    }
    //--------------------------------------------


    //------ NIVEL DE AGUA MAYOR A 100 (ESTADO CRITICO) -----  
     if (NivelAguaDisplay > 100)
    {
      Serial.println("Nivel de Agua: Excedido! %");
      int NivelFB = 100;

          if (Firebase.set(fbdo, node.c_str(), NivelFB))
          {
              Serial.print("Firebase: +");
              printResult(fbdo);
              Serial.println(" ");    
          }
    }
    //--------------------------------------------
      
        delay(100);
  }
  
  //==========================================================




