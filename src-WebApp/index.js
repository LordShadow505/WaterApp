import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  update,
  child,
  get,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAntF7CI-kyL-QlPB_Qt2F58DxlzJBbcso",
  authDomain: "medidoragua-22d31.firebaseapp.com",
  databaseURL: "https://medidoragua-22d31-default-rtdb.firebaseio.com",
  projectId: "medidoragua-22d31",
  storageBucket: "medidoragua-22d31.appspot.com",
  messagingSenderId: "566217242587",
  appId: "1:566217242587:web:e5b8619dce1822ba52d9fe",
  measurementId: "G-KV8E3RW47F",
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db);
const analytics = getAnalytics(app);



//=============================== MENU LATERAL====================================
const MenuIcono = document.querySelector("#MenuIcono"),
  Menu = document.querySelector("#Menu");

MenuIcono.addEventListener("click", (e) => {

  Menu.classList.toggle("Activar");
  document.body.classList.toggle("Opacidad");

  const MenuLateral = e.target.getAttribute("src");

  if (MenuLateral == "menu.svg") {
    e.target.setAttribute("src", "cerrar.svg");
  } else {
    e.target.setAttribute("src", "menu.svg");
  }
});

function openURL(url) {
  window.open(url, "_blank");
}
//===================================================================================





//======================================= MODO OSCURO ================================
var toggle = document.getElementById("Boton");
var body = document.querySelector("body");

var NivelAgua = document.getElementById("Agua");

toggle.onclick = function () {
  toggle.classList.toggle("active");
  body.classList.toggle("active");
};


//===================================================================================





//====================================== GET DATOS ===================================

setInterval(function () {
  get(child(dbRef, `Nivel de Agua/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        NivelAgua.value = snapshot.val();
        
        document.getElementById("Agua").innerHTML = NivelAgua.value + "%";
        if (NivelAgua.value == 100) {
          MoverAgua(0, 0, -22);
          document.getElementById("Advertencia").innerHTML = "¡El tanque está lleno!";
          document.getElementById("Advertencia").style.color = "#2e7d32";
          document.getElementById("Circulo").style.boxShadow =
            "0 0 0 5px #2e7d32";
          document.getElementById("Onda").style.backgroundColor = "#2e7d32";
          document.getElementById("Onda").style.boxShadow =
            "inset 0 0 50px #005005";
          
        } 
        if (NivelAgua.value <= 0) {
          MoverAgua(0, 0, 40);

          document.getElementById("Advertencia").innerHTML = "¡El tanque está vacio!";
          document.getElementById("Advertencia").style.color = "#d32f2f";
          
          document.getElementById("Circulo").style.boxShadow =
            "0 0 0 5px #d32f2f";
          document.getElementById("Onda").style.backgroundColor = "#d32f2f";
          document.getElementById("Onda").style.boxShadow =
            "inset 0 0 50px #9a0007";
        }
        if (NivelAgua.value > 0 && NivelAgua.value < 100) {
          MoverAgua(0, 0, 40 - NivelAgua.value * 0.6);
          document.getElementById("Advertencia").innerHTML = "Nivel de agua normal";
          document.getElementById("Advertencia").style.color = "#42a7e0";
          document.getElementById("Circulo").style.boxShadow =
          "0 0 0 5px #42a7e0";
          document.getElementById("Onda").style.backgroundColor = "#5DC5FF";
          document.getElementById("Onda").style.boxShadow =
          "inset 0 0 50px rgb(36, 156, 255)";;
        }       
      } else {
        console.log("No se recibieron datos");
      }
    })
    .catch((error) => {
      console.error(error);
    });

    return NivelAgua.value;
}, 1000);

function MoverAgua(rotateDeg, x, y){
  var Onda = document.getElementById("Onda");
  Onda.style.transform  = "rotate(" + rotateDeg + "deg) translate(" + x + "%, " + y + "%)";
}




//===================================================================================






//=============================== GRAFICA ===========================================

Highcharts.setOptions({
  lang: {
          loading: 'Cargando...',
          months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
          shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          exportButtonTitle: "Exportar",
          printButtonTitle: "Importar",
          rangeSelectorFrom: "Desde",
          rangeSelectorTo: "Hasta",
          rangeSelectorZoom: "Período",
          downloadPNG: 'Descargar imagen PNG',
          downloadJPEG: 'Descargar imagen JPEG',
          downloadPDF: 'Descargar imagen PDF',
          downloadSVG: 'Descargar imagen SVG',
          downloadXLS: 'Descargar XLS',
          downloadCSV: 'Descargar CSV',
          viewData: 'Ver tabla de datos',
          contextButtonTitle: 'Opciones',
          printChart: 'Imprimir',
          resetZoom: 'Reiniciar zoom',
          resetZoomTitle: 'Reiniciar zoom',
          thousandsSep: ",",
          decimalPoint: '.',
          viewFullscreen:"Ver en pantalla completa"
      }        
});

Highcharts.stockChart('GraficaBox', {
  chart: {

      //Estas lineas le dan el estilo a la grafica
      //En mi caso use los mismos colores que otros 
      type: 'areaspline',
      fontFamily: 'roboto',
      backgroundColor: '#9ddbff',
      gridLineColor: '#9ddbff',
      spacingBottom: 0,
      spacingTop: 0,
      events: {
          load: function () {

              
              var series = this.series[0];
              setInterval(function () {
                  var x = (new Date()).getTime(),                    
                      y = NivelAgua.value; 
                  series.addPoint([x, y], true, true);
              }, 1000);
          }
      }
      
  },

  time: {
      useUTC: false
  },

  navigator: {
    enabled: false
},
  rangeSelector: {
      buttons: [{
          count: 1,
          type: 'hour',
          text: '1H'
      }, {
          count: 5,
          type: 'hour',
          text: '24H'
      }, {
          type: 'all',
          text: 'TODO'
      }],
      inputEnabled: false,
      selected: 0
  },

  series: [{
      name: 'Nivel de Agua',
      data: (function () {
          // Dummy data
          var data = [],
              time = (new Date()).getTime(),
              i;

          for (i = -20; i <= 0; i += 1) {
              data.push([
                  time + i * 1000,
                  NivelAgua.value
              ]);
          }
          return data;
      }())
  }],/*
      data: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
      ]
  }],*/
  exporting: {
    showTable: false
}
});

Highcharts.chart('container', {
  data: {
    table: 'datatable'
  },
  chart: {
    type: 'line'
  },
  title: {
    text: 'Data extracted from a HTML table in the page'
  },

  navigator: {
    adaptToUpdatedData: false,
    series: {
      data: data
    }
  },

  yAxis: {
    allowDecimals: false,
    title: {
      text: 'Units'
    }
  },
  tooltip: {
    formatter: function () {
      return '<b>' + this.series.name + '</b><br/>' +
        this.point.y + ' ' + this.point.name.toLowerCase();
    }
  }
});