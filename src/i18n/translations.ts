export type Locale = 'en' | 'fr';

export type TranslationKey =
  | 'header.viewGrid'
  | 'header.viewList'
  | 'header.viewMap'
  | 'header.settings'
  | 'header.editLocation'
  | 'card.fullscreen'
  | 'card.exitFullscreen'
  | 'home.myLocations'
  | 'home.addLocation'
  | 'home.refresh'
  | 'home.refreshing'
  | 'home.dragToReorder'
  | 'empty.noLocations'
  | 'empty.startMessage'
  | 'empty.addFirst'
  | 'settings.backHome'
  | 'settings.title'
  | 'settings.language'
  | 'settings.languageLabel'
  | 'settings.languageEnglish'
  | 'settings.languageFrench'
  | 'settings.units'
  | 'settings.temperature'
  | 'settings.windSpeed'
  | 'settings.refresh'
  | 'settings.refreshLabel'
  | 'settings.minutes5'
  | 'settings.minutes15'
  | 'settings.minutes30'
  | 'settings.hour1'
  | 'settings.appearance'
  | 'settings.theme'
  | 'settings.themeLight'
  | 'settings.themeDark'
  | 'settings.themeAuto'
  | 'settings.defaultView'
  | 'settings.defaultViewLabel'
  | 'settings.gridView'
  | 'settings.listView'
  | 'settings.mapView'
  | 'settings.notifications'
  | 'settings.pushNotifications'
  | 'settings.weatherAlerts'
  | 'settings.notificationsHint'
  | 'settings.about'
  | 'settings.aboutText'
  | 'offline.message'
  | 'map.empty'
  | 'map.webcamsCount'
  | 'list.webcamCount'
  | 'list.weatherUnavailable'
  | 'list.sortBy'
  | 'list.sortNameAsc'
  | 'list.sortNameDesc'
  | 'list.sortDateAsc'
  | 'list.sortDateDesc'
  | 'list.sortCustom'
  | 'location.webcamUnavailable'
  | 'location.weatherUnavailable'
  | 'location.feelsLike'
  | 'location.humidity'
  | 'location.windSpeed'
  | 'location.pressure'
  | 'location.visibility'
  | 'location.forecast'
  | 'add.title'
  | 'add.searchCity'
  | 'add.mapPicker'
  | 'add.manualEntry'
  | 'add.searchLabel'
  | 'add.searchPlaceholder'
  | 'add.searching'
  | 'add.search'
  | 'add.searchTip'
  | 'add.startSearching'
  | 'add.tryPopular'
  | 'add.selectLocation'
  | 'add.manualInfo'
  | 'add.mapInfo'
  | 'add.locationName'
  | 'add.latitude'
  | 'add.longitude'
  | 'add.howToFindCoords'
  | 'add.coordsTipGoogleMaps'
  | 'add.coordsTipSearch'
  | 'add.continueToWebcams'
  | 'add.selectedCoords'
  | 'add.backToSearch'
  | 'add.searchingWebcams'
  | 'add.foundNearby'
  | 'add.foundCount'
  | 'add.added'
  | 'add.add'
  | 'add.quickAddHint'
  | 'add.noneFound'
  | 'add.tryGoogleTerms'
  | 'add.webcamUrls'
  | 'add.addAnother'
  | 'add.urlPlaceholder'
  | 'add.namePlaceholderOptional'
  | 'add.urlHint'
  | 'add.cancel'
  | 'add.adding'
  | 'add.addLocation'
  | 'add.webcamRequiredTitle'
  | 'add.webcamRequiredMessage'
  | 'add.errorTitle'
  | 'add.errorAddLocation'
  | 'add.errorNoLocations'
  | 'add.errorInvalidCoords'
  | 'add.errorSelectMapLocation'
  | 'add.useCurrentLocation'
  | 'add.locating'
  | 'add.myLocationName'
  | 'add.gpsNotSupported'
  | 'add.gpsPermissionDenied'
  | 'add.gpsPositionUnavailable'
  | 'add.gpsTimeout'
  | 'add.gpsUnknownError'
  | 'edit.title'
  | 'edit.postalCode'
  | 'edit.postalCodePlaceholder'
  | 'edit.searchingWebcams'
  | 'edit.foundNearby'
  | 'edit.foundCount'
  | 'edit.quickAddHint'
  | 'edit.webcamUrls'
  | 'edit.addAnother'
  | 'edit.cancel'
  | 'edit.saving'
  | 'edit.saveChanges'
  | 'edit.webcamRequiredTitle'
  | 'edit.webcamRequiredMessage'
  | 'edit.successTitle'
  | 'edit.successMessage'
  | 'edit.errorSave'
  | 'update.title'
  | 'update.confirm'
  | 'update.later'
  | 'update.message'
  | 'update.reloadHint';

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    'header.viewGrid': 'Grid View',
    'header.viewList': 'List View',
    'header.viewMap': 'Map View',
    'header.settings': 'Settings',
    'header.editLocation': 'Edit location',
    'card.fullscreen': 'Fullscreen',
    'card.exitFullscreen': 'Exit fullscreen',
    'home.myLocations': 'My Locations',
    'home.addLocation': 'Add Location',
    'home.refresh': 'Refresh All',
    'home.refreshing': 'Refreshing...',
    'home.dragToReorder': 'Drag items to reorder (custom sort only)',
    'empty.noLocations': 'No locations added yet',
    'empty.startMessage': 'Start by adding your favorite locations to view webcams and weather forecasts.',
    'empty.addFirst': 'Add Your First Location',
    'settings.backHome': 'Back to Home',
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.languageLabel': 'App language',
    'settings.languageEnglish': 'English',
    'settings.languageFrench': 'French',
    'settings.units': 'Units',
    'settings.temperature': 'Temperature',
    'settings.windSpeed': 'Wind Speed',
    'settings.refresh': 'Refresh Interval',
    'settings.refreshLabel': 'Default refresh interval for webcams and weather',
    'settings.minutes5': '5 minutes',
    'settings.minutes15': '15 minutes',
    'settings.minutes30': '30 minutes',
    'settings.hour1': '1 hour',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.themeAuto': 'Auto (System)',
    'settings.defaultView': 'Default View',
    'settings.defaultViewLabel': 'Default view when opening the app',
    'settings.gridView': 'Grid View',
    'settings.listView': 'List View',
    'settings.mapView': 'Map View',
    'settings.notifications': 'Notifications',
    'settings.pushNotifications': 'Enable push notifications',
    'settings.weatherAlerts': 'Weather alerts',
    'settings.notificationsHint': 'Enable push notifications to receive weather alerts and updates',
    'settings.about': 'About',
    'settings.aboutText': 'View webcams and weather forecasts from your favorite locations',
    'offline.message': 'You are offline',
    'map.empty': 'Add locations to see them on the map',
    'map.webcamsCount': '{count} webcam(s)',
    'list.webcamCount': '{count} webcam{suffix}',
    'list.weatherUnavailable': 'Weather unavailable',
    'list.sortBy': 'Sort by',
    'list.sortNameAsc': 'Name (A-Z)',
    'list.sortNameDesc': 'Name (Z-A)',
    'list.sortDateAsc': 'Oldest first',
    'list.sortDateDesc': 'Newest first',
    'list.sortCustom': 'Custom order',
    'location.webcamUnavailable': 'Webcam unavailable',
    'location.weatherUnavailable': 'Weather data unavailable',
    'location.feelsLike': 'Feels like',
    'location.humidity': 'Humidity',
    'location.windSpeed': 'Wind speed',
    'location.pressure': 'Pressure',
    'location.visibility': 'Visibility',
    'location.forecast': '4-Day Forecast',
    'add.title': 'Add Location',
    'add.searchCity': 'Search City',
    'add.mapPicker': 'Map Picker',
    'add.manualEntry': 'Manual Entry',
    'add.searchLabel': 'Search for a City',
    'add.searchPlaceholder': 'e.g., Paris, Tokyo, New York, London...',
    'add.searching': 'Searching...',
    'add.search': 'Search',
    'add.searchTip': 'Tip: Search for city names (e.g., "Lyon" or "Marseille" for France), not country names.',
    'add.startSearching': 'Start searching for a location',
    'add.tryPopular': 'Try popular cities:',
    'add.selectLocation': 'Select a location:',
    'add.manualInfo': 'Manual Entry Mode: Use this when the weather API is unavailable. You can still add locations and view webcams.',
    'add.mapInfo': 'Map Picker Mode: Click anywhere on the map to select a location. You can zoom and pan to find the exact spot.',
    'add.locationName': 'Location Name',
    'add.latitude': 'Latitude',
    'add.longitude': 'Longitude',
    'add.howToFindCoords': 'How to find coordinates:',
    'add.coordsTipGoogleMaps': 'Google Maps: Right-click location -> first two numbers',
    'add.coordsTipSearch': 'Search "[city name] coordinates" on Google',
    'add.continueToWebcams': 'Continue to Webcams',
    'add.selectedCoords': 'Selected: Lat: {lat}, Lon: {lon}',
    'add.backToSearch': 'Back to search',
    'add.searchingWebcams': 'Searching for nearby webcams...',
    'add.foundNearby': 'Found Webcams Nearby',
    'add.foundCount': '{count} found',
    'add.added': 'Added',
    'add.add': 'Add',
    'add.quickAddHint': 'Click "+ Add" to quickly add webcams, or manually enter URLs below',
    'add.noneFound': 'No webcams found automatically',
    'add.tryGoogleTerms': 'Try searching Google with these terms:',
    'add.webcamUrls': 'Webcam URLs',
    'add.addAnother': 'Add Another',
    'add.urlPlaceholder': 'https://example.com/webcam.jpg',
    'add.namePlaceholderOptional': 'Webcam name (optional)',
    'add.urlHint': 'Add direct image URLs from public webcams (JPEG, PNG, etc.)',
    'add.cancel': 'Cancel',
    'add.adding': 'Adding...',
    'add.addLocation': 'Add Location',
    'add.webcamRequiredTitle': 'Webcam Required',
    'add.webcamRequiredMessage': 'Please add at least one webcam URL to continue.',
    'add.errorTitle': 'Error',
    'add.errorAddLocation': 'Failed to add location. Please try again.',
    'add.errorNoLocations': 'No locations found. Try searching for a city name (e.g., "Paris", "Tokyo", "New York")',
    'add.errorInvalidCoords': 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.',
    'add.errorSelectMapLocation': 'Please click on the map to select a location.',
    'add.useCurrentLocation': 'Use my GPS location',
    'add.locating': 'Locating...',
    'add.myLocationName': 'My location',
    'add.gpsNotSupported': 'GPS is not supported on this device/browser.',
    'add.gpsPermissionDenied': 'Location permission denied. Please allow GPS access.',
    'add.gpsPositionUnavailable': 'Unable to determine your current location.',
    'add.gpsTimeout': 'GPS location request timed out. Please try again.',
    'add.gpsUnknownError': 'Unable to retrieve GPS location.',
    'edit.title': 'Edit Location',
    'edit.postalCode': 'Postal Code',
    'edit.postalCodePlaceholder': 'e.g. 75001',
    'edit.searchingWebcams': 'Searching for nearby webcams...',
    'edit.foundNearby': 'Found Webcams Nearby',
    'edit.foundCount': '{count} found',
    'edit.quickAddHint': 'Click "+ Add" to add these webcams, or edit URLs below',
    'edit.webcamUrls': 'Webcam URLs',
    'edit.addAnother': 'Add Another',
    'edit.cancel': 'Cancel',
    'edit.saving': 'Saving...',
    'edit.saveChanges': 'Save Changes',
    'edit.webcamRequiredTitle': 'Webcam Required',
    'edit.webcamRequiredMessage': 'Please add at least one webcam URL.',
    'edit.successTitle': 'Success',
    'edit.successMessage': 'Location updated successfully!',
    'edit.errorSave': 'Failed to save location. Please try again.',
    'update.title': 'Update Available',
    'update.confirm': 'Update Now',
    'update.later': 'Later',
    'update.message': 'A new version of MeteoCam is available. Would you like to update now?',
    'update.reloadHint': 'The app will reload after updating.',
  },
  fr: {
    'header.viewGrid': 'Vue grille',
    'header.viewList': 'Vue liste',
    'header.viewMap': 'Vue carte',
    'header.settings': 'Parametres',
    'header.editLocation': 'Modifier le lieu',
    'card.fullscreen': 'Plein ecran',
    'card.exitFullscreen': 'Quitter le plein ecran',
    'home.myLocations': 'Mes lieux',
    'home.addLocation': 'Ajouter un lieu',
    'home.refresh': 'Tout actualiser',
    'home.refreshing': 'Actualisation...',
    'home.dragToReorder': 'Glissez les elements pour reordonner (tri personnalise uniquement)',
    'empty.noLocations': 'Aucun lieu ajoute pour le moment',
    'empty.startMessage': 'Ajoutez vos lieux favoris pour voir les webcams et les previsions meteo.',
    'empty.addFirst': 'Ajouter votre premier lieu',
    'settings.backHome': 'Retour a l accueil',
    'settings.title': 'Parametres',
    'settings.language': 'Langue',
    'settings.languageLabel': 'Langue de l application',
    'settings.languageEnglish': 'Anglais',
    'settings.languageFrench': 'Francais',
    'settings.units': 'Unites',
    'settings.temperature': 'Temperature',
    'settings.windSpeed': 'Vitesse du vent',
    'settings.refresh': 'Frequence de rafraichissement',
    'settings.refreshLabel': 'Frequence par defaut pour webcams et meteo',
    'settings.minutes5': '5 minutes',
    'settings.minutes15': '15 minutes',
    'settings.minutes30': '30 minutes',
    'settings.hour1': '1 heure',
    'settings.appearance': 'Apparence',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Clair',
    'settings.themeDark': 'Sombre',
    'settings.themeAuto': 'Auto (Systeme)',
    'settings.defaultView': 'Vue par defaut',
    'settings.defaultViewLabel': 'Vue par defaut a l ouverture',
    'settings.gridView': 'Vue grille',
    'settings.listView': 'Vue liste',
    'settings.mapView': 'Vue carte',
    'settings.notifications': 'Notifications',
    'settings.pushNotifications': 'Activer les notifications push',
    'settings.weatherAlerts': 'Alertes meteo',
    'settings.notificationsHint': 'Activez les notifications push pour recevoir les alertes et mises a jour meteo',
    'settings.about': 'A propos',
    'settings.aboutText': 'Affichez les webcams et previsions meteo de vos lieux favoris',
    'offline.message': 'Vous etes hors ligne',
    'map.empty': 'Ajoutez des lieux pour les voir sur la carte',
    'map.webcamsCount': '{count} webcam(s)',
    'list.webcamCount': '{count} webcam{suffix}',
    'list.weatherUnavailable': 'Meteo indisponible',
    'list.sortBy': 'Trier par',
    'list.sortNameAsc': 'Nom (A-Z)',
    'list.sortNameDesc': 'Nom (Z-A)',
    'list.sortDateAsc': 'Plus anciens',
    'list.sortDateDesc': 'Plus recents',
    'list.sortCustom': 'Ordre personnalise',
    'location.webcamUnavailable': 'Webcam indisponible',
    'location.weatherUnavailable': 'Donnees meteo indisponibles',
    'location.feelsLike': 'Ressenti',
    'location.humidity': 'Humidite',
    'location.windSpeed': 'Vitesse du vent',
    'location.pressure': 'Pression',
    'location.visibility': 'Visibilite',
    'location.forecast': 'Previsions 4 jours',
    'add.title': 'Ajouter un lieu',
    'add.searchCity': 'Rechercher une ville',
    'add.mapPicker': 'Selection sur carte',
    'add.manualEntry': 'Saisie manuelle',
    'add.searchLabel': 'Rechercher une ville',
    'add.searchPlaceholder': 'ex. Paris, Tokyo, New York, Londres...',
    'add.searching': 'Recherche...',
    'add.search': 'Rechercher',
    'add.searchTip': 'Astuce: recherchez un nom de ville (ex. "Lyon" ou "Marseille"), pas un pays.',
    'add.startSearching': 'Commencez par rechercher un lieu',
    'add.tryPopular': 'Villes populaires :',
    'add.selectLocation': 'Selectionnez un lieu :',
    'add.manualInfo': 'Mode manuel: utilisez-le si l API meteo est indisponible. Vous pouvez toujours ajouter des lieux et voir les webcams.',
    'add.mapInfo': 'Mode carte: cliquez sur la carte pour choisir un lieu. Zoomez et deplacez-vous pour etre precis.',
    'add.locationName': 'Nom du lieu',
    'add.latitude': 'Latitude',
    'add.longitude': 'Longitude',
    'add.howToFindCoords': 'Comment trouver les coordonnees :',
    'add.coordsTipGoogleMaps': 'Google Maps: clic droit sur un lieu -> deux premiers nombres',
    'add.coordsTipSearch': 'Recherchez "coordonnees [nom de la ville]" sur Google',
    'add.continueToWebcams': 'Continuer vers les webcams',
    'add.selectedCoords': 'Selection: Lat: {lat}, Lon: {lon}',
    'add.backToSearch': 'Retour a la recherche',
    'add.searchingWebcams': 'Recherche de webcams a proximite...',
    'add.foundNearby': 'Webcams trouvees a proximite',
    'add.foundCount': '{count} trouvees',
    'add.added': 'Ajoutee',
    'add.add': 'Ajouter',
    'add.quickAddHint': 'Cliquez sur "+ Add" pour ajouter vite des webcams, ou saisissez les URL ci-dessous',
    'add.noneFound': 'Aucune webcam trouvee automatiquement',
    'add.tryGoogleTerms': 'Essayez ces recherches Google :',
    'add.webcamUrls': 'URLs des webcams',
    'add.addAnother': 'Ajouter une autre',
    'add.urlPlaceholder': 'https://example.com/webcam.jpg',
    'add.namePlaceholderOptional': 'Nom de la webcam (optionnel)',
    'add.urlHint': 'Ajoutez des URLs d images directes de webcams publiques (JPEG, PNG, etc.)',
    'add.cancel': 'Annuler',
    'add.adding': 'Ajout...',
    'add.useCurrentLocation': 'Utiliser ma position GPS',
    'add.locating': 'Localisation...',
    'add.myLocationName': 'Ma position',
    'add.gpsNotSupported': 'Le GPS n est pas pris en charge sur cet appareil/navigateur.',
    'add.gpsPermissionDenied': 'Autorisation de localisation refusee. Veuillez autoriser l acces GPS.',
    'add.gpsPositionUnavailable': 'Impossible de determiner votre position actuelle.',
    'add.gpsTimeout': 'La demande de position GPS a expire. Veuillez reessayer.',
    'add.gpsUnknownError': 'Impossible de recuperer la position GPS.',
    'add.addLocation': 'Ajouter un lieu',
    'add.webcamRequiredTitle': 'Webcam requise',
    'add.webcamRequiredMessage': 'Veuillez ajouter au moins une URL de webcam pour continuer.',
    'add.errorTitle': 'Erreur',
    'add.errorAddLocation': 'Impossible d ajouter le lieu. Veuillez reessayer.',
    'add.errorNoLocations': 'Aucun lieu trouve. Essayez une ville (ex. "Paris", "Tokyo", "New York")',
    'add.errorInvalidCoords': 'Coordonnees invalides. Latitude entre -90 et 90, longitude entre -180 et 180.',
    'add.errorSelectMapLocation': 'Veuillez cliquer sur la carte pour selectionner un lieu.',
    'edit.title': 'Modifier le lieu',
    'edit.postalCode': 'Code postal',
    'edit.postalCodePlaceholder': 'ex. 75001',
    'edit.searchingWebcams': 'Recherche de webcams a proximite...',
    'edit.foundNearby': 'Webcams trouvees a proximite',
    'edit.foundCount': '{count} trouvees',
    'edit.quickAddHint': 'Cliquez sur "+ Add" pour ajouter ces webcams, ou modifiez les URL ci-dessous',
    'edit.webcamUrls': 'URLs des webcams',
    'edit.addAnother': 'Ajouter une autre',
    'edit.cancel': 'Annuler',
    'edit.saving': 'Enregistrement...',
    'edit.saveChanges': 'Enregistrer',
    'edit.webcamRequiredTitle': 'Webcam requise',
    'edit.webcamRequiredMessage': 'Veuillez ajouter au moins une URL de webcam.',
    'edit.successTitle': 'Succes',
    'edit.successMessage': 'Lieu mis a jour avec succes !',
    'edit.errorSave': 'Impossible d enregistrer le lieu. Veuillez reessayer.',
    'update.title': 'Mise a jour disponible',
    'update.confirm': 'Mettre a jour',
    'update.later': 'Plus tard',
    'update.message': 'Une nouvelle version de MeteoCam est disponible. Voulez-vous mettre a jour maintenant ?',
    'update.reloadHint': 'L application se rechargera apres la mise a jour.',
  },
};
