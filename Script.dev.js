
/*

	- À faire :

		- bouton pour arrêter une vidéo en cours
			- garder l'iframe en cours
			- afficher un bouton flottant
			- cliquer dessus pour arrêter

		- retardateur avant de vraiment charger une frame : être sûr que l'utilisateur reste plus de .5s (pas dans un défilement rapide !)

		- finir pour téléphone mdrrr

*/

// Fonctions nécessaires
$  = (x) => document.querySelector(x)
$$ = (x) => document.querySelectorAll(x)

// Quand le document est chargé
document.addEventListener("DOMContentLoaded", function () {

	// Initialisation des variables d'éléments HTML
	Conteneur = $("#conteneur")
	Fenêtres = $$("section")
	menuNavigation = $("nav")
	boutonMenu = $("#boutonMenu")
	filtre = $("#filtre")
	boutonPrécédent = $("#boutonPrécédent")
	boutonSuivant = $("#boutonSuivant")

	autorisationDéfilement = true

	// Pour chaque fenêtre
	Array.from(Fenêtres).forEach(function (fenêtre, index) {
		// Ajout d'un attribute data-id
		fenêtre.setAttribute("data-id", index)
	})

	// Pour chaque lien de la barre de navigation
	Array.from(menuNavigation.children).forEach(function (lienVers) {
		// Ajoute un écouteur de clic pour fermer le menu et pour gérer l'affichage des boutons de navigation rapide
		// Avec la fenêtre dont l'identifiant correspond au href du lien cliqué ou avec la fenêtre déjà courante si le lien cliqué est celui de fermeture du menu
		lienVers.addEventListener("click", function () {
			fermerMenu()
			gérerBoutonRapides($(lienVers.getAttribute("href")) || fenêtreCourante)
		})
	})

	// Ouverture du menu lors d'un clic sur le bouton de menu
	boutonMenu.addEventListener("click", ouvrirMenu)

	// Ajoute un écouteur de clic sur le bouton ciblant la fenêtre précédente
	boutonPrécédent.addEventListener("click", Précédent)
	// Ajoute un écouteur de clic sur le bouton ciblant la fenêtre suivante
	boutonSuivant.addEventListener("click", Suivant)

	// Ajoute un écouteur de clic sur le filtre et les liens du menu pour fermer le menu
	filtre.addEventListener("click", fermerMenu)

	// Après 250ms, lance un défilement vers l'élément qui a le hash de l'URL ou ajoute un hash à l'URL s'il n'y en a pas déjà un
	setTimeout(function () {
		// Si l'URL contient un hash
		if (location.hash) {
			// Défile vers l'élément qui porte l'id correspondant au hash de l'URL tout en le stockant dans une variable globale
			(fenêtreCourante = $(location.hash)).scrollIntoView(paramètreDéfilement)
		}
		else {
			// Sinon met un hash correspondant au premier élément de la page
			fenêtreCourante = Fenêtres[0]
			location.hash = fenêtreCourante.getAttribute("id")
		}
		gérerBoutonRapides(fenêtreCourante)
		// Change le nom de l'onglet
		document.title = Correspondance[location.hash.replace("#", "")] + " - " + nomProjet
		// Met à jour le lien actif de la barre de navigation
		actualiserLienCourant()
	}, 250)

	// Ensemble des iframe de la page
	let iFrames = Array.from($$("iframe"))

	// Crée un observeur d'entrée d'élément dans le champ de vision
	Observeur = new IntersectionObserver(function (iFrameÉléments) {
		// On applique la même fonction pour tout les observés (seulement des iFrame)
		iFrameÉléments.forEach(function (iFrameÉlément) {
			// Retardateur pour empêcher le chargement des éléments lors d'un défilement accéléré
			if (iFrameÉlément.intersectionRatio > 0) {
				// transforme l'attribut sourceVideo en src et supprimer l'observateur
				iFrameÉlément.target.setAttribute("src", iFrameÉlément.target.getAttribute("sourceVideo"))
				iFrameÉlément.target.removeAttribute("sourceVideo")
				Observeur.unobserve(iFrameÉlément.target)
			}
		})
	// Ratio partie visible / hauteur totale, à partir duquel un élément est considéré présent dans le champ de vision
	}, { threshold: [0] })

	iFrames.forEach(function (iFrameÉlément) {
		// Met un observateur sur chaque iFrame
		Observeur.observe(iFrameÉlément)
	})

	paramètreDéfilement = { behavior: "smooth" }
})

// Fonctions pour les boutons
Précédent = function () {
	let fenêtrePrécédente = fenêtreCourante.previousElementSibling
	// Défile vers l'élément précédent et met son id dans l'URL s'il existe
	if (fenêtrePrécédente) {
		défilerVers(fenêtrePrécédente)
	}
}

Suivant = function () {
	let fenêtreSuivante = fenêtreCourante.nextElementSibling
	// Défile vers l'élément suivant et met son id dans l'URL s'il existe
	if (fenêtreSuivante) {
		défilerVers(fenêtreSuivante)
	}
}

// Mettre à jour l'élément actif de la barre de navigation
actualiserLienCourant = function () {
	// Lien du menu avec un href vers le hash de l'URL ou le hash duquel on a modifié le dernier chiffre (pour certaines pages)
	let élément = $('nav a[href="' + location.hash + '"]') || $('nav a[href="' + location.hash.replace(/\d$/, "1") + '"]')
	// Si cet élément existe
	if (élément) {
		// S'il y a un élément déjà courant
		if ($("nav > a.actif")) {
			// Lui retire la classe actif
			$("nav > a.actif").classList.remove("actif")
		}
		// Et la met sur le lien dont le href correspond au nouveau hash de l'URL
		élément.classList.add("actif")
	}
}

// Interrompt l'événement reçu en argument
annulerÉvénement = function (événement) {
	// Annule l'effet de scroll par défaut (100px)
	événement.preventDefault()
	événement.returnValue = false
	événement.stopPropagation()
}

gérerBoutonRapides = function (fenêtre) {
	fenêtre == Fenêtres[0]                   ? boutonPrécédent.classList.add("caché") : boutonPrécédent.classList.remove("caché")
	fenêtre == Fenêtres[Fenêtres.length - 1] ? boutonSuivant.classList.add("caché")   : boutonSuivant.classList.remove("caché")
}

défilerVers = function (fenêtre) {
	fenêtre.scrollIntoView(paramètreDéfilement)
	location.hash = fenêtre.getAttribute("id")
	gérerBoutonRapides(fenêtre)
}

// Fonction de défilement sur la page
Défiler = function (événement) {
	if (!menuNavigation.classList.contains("visible")) {
		annulerÉvénement(événement)
		// Si le défilement est autorisé et que le menu n'est pas ouvert
		// Le but de cette condition est d'éviter de faire trop "boguer" la page par surcharge de défilement
		if (autorisationDéfilement) {
			// Récupération de la valeur de la direction du défilement en booléen
			let sens = événement.deltaY > 0,
				// Récupération d'un élément selon son data-id
				// Calcul du niveau de scroll divisé par la hauteur d'une fenêtre => arrondi
				// Puis ajoute ou retranche 1 selon le sens de défilement
				élément = $('section[data-id="' + (Math.round(Conteneur.scrollTop / Fenêtres[0].offsetHeight) + (sens ? 1 : -1)) + '"]')
			// Si l'élément existe (il n'y a pas d'élément avant la première fenêtre par exemple), défile vers l'élément est ajoute son identifiant à l'URL de la page
			élément && 	défilerVers(élément)
			// Retrait temporaire de l'autorisation de défilement
			autorisationDéfilement = false
			setTimeout(function () {
				// Restauration de l'autorisation après 1/2 seconde
				autorisationDéfilement = true 
			}, 500)
		}
	}
}

historiqueDynamique = function () {
	// Défile vers l'élément portant le hash de l'URL
	let fenêtre = fenêtreCourante = $(location.hash)
	fenêtreCourante.scrollIntoView(paramètreDéfilement)
	// Change le nom de l'onglet
	document.title = Correspondance[location.hash.substr(1)] + " - " + nomProjet
	// Met à jour le lien actif de la barre de navigation
	actualiserLienCourant()
	gérerBoutonRapides(fenêtre)
}

// Si l'utilisateur utilise les boutons d'historique de l'onglet
// Ou ajoute une nouvelle page à l'historique (changement du hash)
window.addEventListener("popstate", function () {
	// Si le hash existe dans l'URL
	if (location.hash) {
		// Retardateur de 150ms
		setTimeout(historiqueDynamique, 150)
	}
})

// La fonction précédente est appelée lorsqu'un défilement a lieu
window.addEventListener("wheel", function (événement) {
	if (!événement.ctrlKey) {
		Défiler(événement)
	}
})

// Si la page est redimensionnée, défile vers le haut de l'élément courant
// Pour recaler la page sur celui-ci après le déplacement dû au redimensionnement
window.addEventListener("resize", function () {
	$(location.hash).scrollIntoView(paramètreDéfilement)
})

// Fonctions d'ouverture et fermeture du menu
menuOuvert = false
fermerMenu = function () {
	// Retrait de classes pour masquer menu et filtre et rafficher le bouton
	menuNavigation.classList.remove("visible")
	filtre.classList.remove("actif")
	boutonMenu.classList.remove("caché")
	menuOuvert = false
}

ouvrirMenu = function () {
	menuNavigation.classList.add("visible")
	filtre.classList.add("actif")
	boutonMenu.classList.add("caché")
	menuOuvert = true
}

// Compteur de pressions des touches flèches et changement de fenêtre en un temps imparti
pressions = 0
retardateurDéfilement = null

// Lorsqu'une touche est pressée
window.addEventListener("keyup", function (événement) {
	// Espace pour interrompre un défilement
	if (événement.keyCode == 32) {
		let fenêtre = fenêtreCourante = $('section[data-id="' + Math.round(Conteneur.scrollTop / Fenêtres[0].offsetHeight) + '"]')
		défilerVers(fenêtre)
	}
	// Sinon si flèche haut / bas ou saut de fenêtre haut / bas
	else if ([33, 34, 38, 40].includes(événement.keyCode)) {
		// Sens vaut -1 si presse touche de scroll vers le bas à côté du pavé numérique OU flèche bas
		// Sinon vaut 1 si presse touche de scroll vers le haut OU flèche haut
		let sens = ([33, 38].includes(événement.keyCode)) ? -1 : 1
		// Compte le nombre de pressions (et implicitement le sens)
		pressions += sens

		if (retardateurDéfilement === null) {
			retardateurDéfilement = setTimeout(function () {
				// Cherche la fenêtre d'arrivée
				var fenêtre = $('section[data-id="' + (Math.round(Conteneur.scrollTop / Fenêtres[0].offsetHeight) + pressions) + '"]')
				// Si elle existe, défile vers celle-ci
				if (fenêtre) {
					défilerVers(fenêtre)
				}
				// Sinon (la cible théorique n'existe pas)
				else {
					// Tant que la fenêtre la plus proche n'est pas trouvée
					while (fenêtre == null) {
						// Modifie le nombre de pressions en fonction du sens :
						// Diminue si vers le bas et augmente si vers le haut
						sens > 0 ? --pressions : ++pressions
						// Cherche la fenêtre avec le nombre de pressions modifié
						fenêtre = $('section[data-id="' + (Math.round(Conteneur.scrollTop / Fenêtres[0].offsetHeight) + pressions) + '"]')
						// Dès lors que la fenêtre existe, défile vers celle-ci
						fenêtre && défilerVers(fenêtre)
						// Sinon refait un tour de la boucle
					}
				}
				fenêtreCourante = fenêtre
				// Ici on réinitialise les valeurs après le défilement
				pressions = 0
				retardateurDéfilement = null
			}, 250)
		}
	}
	// Début du document
	else if (événement.keyCode == 36) {
		// Défile vers la première fenêtre
		défilerVers(Fenêtres[0])
	}
	// Fin du document
	else if (événement.keyCode == 35) {
		// Défile vers la dernière fenêtre
		défilerVers(Fenêtres[Fenêtres.length - 1])
	}
})





/* Code pour les tactiles */

mobile = null

// Lorsqu'un défilement est lancé sur téléphone
window.addEventListener("touchstart", function (événement) {
	// .closest() capture l'élément correspondant au sélecteur qui est plus proche parent de l'élément sur lequel on exécute la méthode
	let élément = événement["changedTouches"]["0"]["target"].closest("section") || $(location.hash)
	if (élément) {
		// Enregistre un objet contenant les valeurs utiles
		mobile = {
			direction_X: événement["changedTouches"]["0"]["clientX"],
			direction_Y: événement["changedTouches"]["0"]["clientY"],
			élément: parseInt(élément.getAttribute("data-id"), 10)
		}
	}
	else {
		mobile = null
	}
})

window.addEventListener("touchend", function (événement) {
	if (mobile) {
		// Détermine le sens de défilement
		let sens = mobile.direction_Y - événement["changedTouches"]["0"]["clientY"] >= 0,
			// Si la distance en Y est trop faible, le défilement ne se fait pas
			différenceLarge = Math.abs(mobile.direction_Y - événement["changedTouches"]["0"]["clientY"]) >= 100,
			// Élément de destination du défilement
			élément = $('section[data-id="' + (mobile.élément + (sens ? 1 : (0 - 1))) + '"]'),
			// Distance en X lors du déplacement du curseur
			déplacement_X = mobile.direction_X - événement["changedTouches"]["0"]["clientX"]
		// Si le menu est fermé
		if (!menuOuvert) {
			// Défile vers l'élément s'il existe
			(élément && différenceLarge) ? défilerVers(élément) : $(location.hash).scrollIntoView(paramètreDéfilement)
		}
		// Si le déplacement en X est supérieure à 100px
		if (déplacement_X > 100 && !différenceLarge) {
			ouvrirMenu()
		}
		// sinon si inférieur à -100 de la droite vers la gauche ou que le déplacement en y est largement supérieur
		else if (déplacement_X < -100 && !différenceLarge) {
			fermerMenu()
		}
		// Réinitialise la valeur mobile
		mobile = null
	}
})

/*
// Pour que ça fonctionne... il faut comprendre que le navigateur enregistre un touchstart, des touchmove et un touchend
// et donc concevoir le programme en fonction de ça

// Objectif : ajouter un support pour le glissement "libre" sur téléphone, quand l'utilisateur fait glisser la page et relâche (et de l'autre avant)

var touchmovnum = 0,
	firstpos = null
window.addEventListener("touchmove", function (e) {
	if (touchmovnum === 0) {
		firstpos = Conteneur.scrollTop
		touchmovnum++
	}
	else {
		touchmovnum++
		if (touchmovnum === 3) {
			var lastpos = Conteneur.scrollTop,
				scroll = Math.round((lastpos - firstpos) / (Fenêtres[0].offsetHeight / 3)),
				element = $('section[data-title="' + (Math.round(Conteneur.scrollTop / Fenêtres[0].offsetHeight) + scroll) + '"]')
			if (element) {
				console.log(element)
				element.scrollIntoView(paramètreDéfilement) // semble non fonctionnel...
				location.hash = element.getAttribute("id")
			}
			touchmovnum = 0
			firstpos = null
		}
	}
})

 // Est-ce que ça fonctionne ?

 // Objectif : virer la barre d'URL sur mobile (le but de la partie juste au-dessus) en mettant le site en plein écran

if (navigator.userAgent.match(/iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|Android/i)) {
	var requestFullScreen = document.documentElement.requestFullscreen || document.documentElement.mozRequestFullScreen || document.documentElement.webkitRequestFullScreen,
		cancelFullScreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen

	if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
		requestFullScreen.call(document.documentElement)
	}
	else {
		cancelFullScreen.call(document)
	}
}

*/
