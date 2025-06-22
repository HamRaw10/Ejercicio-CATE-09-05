const tablero = document.getElementById('game-board');
const jugadorActualDisplay = document.getElementById('current-player');
const puntajeJugador1Display = document.getElementById('score-1');
const puntajeJugador2Display = document.getElementById('score-2');
const botonReiniciar = document.getElementById('restart-btn');
const pantallaFinJuego = document.getElementById('game-over');
const mensajeGanador = document.getElementById('winner-message');
let primeraCarta = null;
let segundaCarta = null;
let puedeVoltear = true;
let jugadorActual = 1;
let puntajeJugador1 = 0;
let puntajeJugador2 = 0;
let paresEncontrados = 0;
const TOTAL_PARES = 8;
window.addEventListener('DOMContentLoaded', iniciarJuego);
botonReiniciar.addEventListener('click', iniciarJuego);

async function iniciarJuego() {
    tablero.innerHTML = '';
    primeraCarta = null;
    segundaCarta = null;
    puedeVoltear = true;
    jugadorActual = 1;
    puntajeJugador1 = 0;
    puntajeJugador2 = 0;
    paresEncontrados = 0;
    jugadorActualDisplay.textContent = `Jugador ${jugadorActual}`;
    puntajeJugador1Display.textContent = puntajeJugador1;
    puntajeJugador2Display.textContent = puntajeJugador2;
    pantallaFinJuego.style.display = 'none';
    const idsPokemon = [];
    while (idsPokemon.length < TOTAL_PARES) {
        const idAleatorio = Math.floor(Math.random() * 151) + 1;
        if (!idsPokemon.includes(idAleatorio)) {
            idsPokemon.push(idAleatorio);
        }
    }
    
    const idsParaCartas = [...idsPokemon, ...idsPokemon];
    
    barajarCartas(idsParaCartas);
    
    for (const idPokemon of idsParaCartas) {
        await crearCarta(idPokemon);
    }
}

function barajarCartas(ids) {
    for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
    }
}

async function crearCarta(idPokemon) {
    const carta = document.createElement('div');
    carta.className = 'card';
    carta.dataset.idPokemon = idPokemon;
    
    try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${idPokemon}`);
        const datos = await respuesta.json();
        const urlImagen = datos.sprites.other['official-artwork'].front_default || datos.sprites.front_default;
        const frente = document.createElement('img');
        frente.src = urlImagen;
        frente.alt = datos.name;
        const dorso = document.createElement('div');
        dorso.className = 'card-back';
        dorso.textContent = '?';
        carta.appendChild(frente);
        carta.appendChild(dorso);
        carta.addEventListener('click', () => voltearCarta(carta));
        tablero.appendChild(carta);
    } catch (error) {
        console.error('Error al cargar Pokémon:', error);
    }
}

function voltearCarta(carta) {
    if (!puedeVoltear || carta === primeraCarta || carta.classList.contains('flipped')) {
        return;
    }
    
    carta.classList.add('flipped');
    
    if (!primeraCarta) {
        primeraCarta = carta;
    } else {
        segundaCarta = carta;
        puedeVoltear = false;
        setTimeout(verificarCoincidencia, 800);
    }
}

function verificarCoincidencia() {
    const sonIguales = primeraCarta.dataset.idPokemon === segundaCarta.dataset.idPokemon;
    
    if (sonIguales) {
        primeraCarta.removeEventListener('click', voltearCarta);
        segundaCarta.removeEventListener('click', voltearCarta);
        paresEncontrados++;
        
        if (jugadorActual === 1) {
            puntajeJugador1++;
            puntajeJugador1Display.textContent = puntajeJugador1;
        } else {
            puntajeJugador2++;
            puntajeJugador2Display.textContent = puntajeJugador2;
        }
        
        if (paresEncontrados === TOTAL_PARES) {
            finalizarJuego();
        }
    } else {
        primeraCarta.classList.remove('flipped');
        segundaCarta.classList.remove('flipped');
        
        jugadorActual = jugadorActual === 1 ? 2 : 1;
        jugadorActualDisplay.textContent = `Jugador ${jugadorActual}`;
    }
    
    primeraCarta = null;
    segundaCarta = null;
    puedeVoltear = true;
}

function finalizarJuego() {
    if (puntajeJugador1 > puntajeJugador2) {
        mensajeGanador.textContent = '¡JUGADOR 1 GANA!';
    } else if (puntajeJugador2 > puntajeJugador1) {
        mensajeGanador.textContent = '¡JUGADOR 2 GANA!';
    } else {
        mensajeGanador.textContent = '¡EMPATE!';
    }
    
    pantallaFinJuego.style.display = 'flex';
}