// Main Application Logic
class QRGeneratorApp {
	constructor() {
		this.currentQRType = null;
		this.currentQRData = null;
		this.generatedQR = null;
		this.history = this.loadHistory();
		
		this.init();
	}

	init() {
		this.renderQRTypes();
		this.bindEvents();
		this.loadTheme();
	}

	// Render QR Types Grid
	renderQRTypes() {
		const grid = document.getElementById('qrTypeGrid');
		if (!grid) return;

		grid.innerHTML = '';

		Object.values(QR_TYPES).forEach(type => {
			const card = this.createQRTypeCard(type);
			grid.appendChild(card);
		});
	}

	createQRTypeCard(type) {
		const card = document.createElement('div');
		card.className = 'qr-type-card';
		card.dataset.type = type.id;

		card.innerHTML = `
			<div class="qr-type-card-header">
				<svg class="qr-type-icon" viewBox="0 0 24 24" fill="currentColor">
					<path d="${type.icon}"/>
				</svg>
				<div>
					<h3>${type.name}</h3>
					<p>${type.description}</p>
				</div>
			</div>
		`;

		card.addEventListener('click', () => this.selectQRType(type));
		return card;
	}

	// QR Type Selection
	selectQRType(type) {
		document.querySelectorAll('.qr-type-card').forEach(card => {
			card.classList.remove('selected');
		});

		const selectedCard = document.querySelector(`[data-type="${type.id}"]`);
		if (selectedCard) {
			selectedCard.classList.add('selected');
		}

		this.currentQRType = type;
		this.showGeneratorForm();
		this.renderForm();
	}

	// Show/Hide Generator Form
	showGeneratorForm() {
		document.getElementById('qrGeneratorSection').style.display = 'block';
		document.getElementById('qrCustomization').style.display = 'block';
		
		document.getElementById('qrGeneratorSection').scrollIntoView({ 
			behavior: 'smooth' 
		});
	}

	hideGeneratorForm() {
		document.getElementById('qrGeneratorSection').style.display = 'none';
		document.getElementById('qrCustomization').style.display = 'none';
		
		document.querySelectorAll('.qr-type-card').forEach(card => {
			card.classList.remove('selected');
		});
		
		this.currentQRType = null;
		this.currentQRData = null;
		this.generatedQR = null;
	}

	// Render Form Fields
	renderForm() {
		if (!this.currentQRType) return;

		const form = document.getElementById('qrForm');
		const title = document.getElementById('formTitle');
		
		title.textContent = this.currentQRType.name;
		form.innerHTML = '';

		this.currentQRType.fields.forEach(field => {
			const fieldElement = this.createFormField(field);
			form.appendChild(fieldElement);
		});
	}

	createFormField(field) {
		const group = document.createElement('div');
		group.className = 'form-group';

		const label = document.createElement('label');
		label.htmlFor = field.name;
		label.textContent = field.label;
		if (field.required) {
			label.innerHTML += ' <span style="color: var(--danger-color);">*</span>';
		}

		const input = this.createInput(field);
		
		group.appendChild(label);
		group.appendChild(input);

		return group;
	}

	createInput(field) {
		let input;

		switch (field.type) {
			case 'textarea':
				input = document.createElement('textarea');
				input.rows = field.rows || 3;
				break;
			case 'select':
				input = document.createElement('select');
				field.options.forEach(option => {
					const optionElement = document.createElement('option');
					optionElement.value = option.value;
					optionElement.textContent = option.label;
					if (option.value === field.default) {
						optionElement.selected = true;
					}
					input.appendChild(optionElement);
				});
				break;
			default:
				input = document.createElement('input');
				input.type = field.type;
		}

		input.id = field.name;
		input.name = field.name;
		input.className = 'form-control';
		input.placeholder = field.placeholder || '';
		input.required = field.required || false;

		return input;
	}

	// Form Data Handling
	getFormData() {
		const form = document.getElementById('qrForm');
		const formData = new FormData(form);
		const data = {};

		for (let [key, value] of formData.entries()) {
			data[key] = value;
		}

		return data;
	}

	validateForm() {
		console.log('validateForm called');
		console.log('currentQRType:', this.currentQRType);
		
		if (!this.currentQRType) {
			console.log('No currentQRType selected');
			return false;
		}

		const formData = this.getFormData();
		console.log('Form data in validation:', formData);

		for (let field of this.currentQRType.fields) {
			console.log('Checking field:', field.name, 'required:', field.required);
			if (field.required && (!formData[field.name] || formData[field.name].trim() === '')) {
				console.log('Field validation failed:', field.name);
				this.showToast('error', `El campo "${field.label}" es requerido`);
				return false;
			}
		}

		console.log('Form validation passed');
		return true;
	}

	// QR Generation
	async generateQR() {
		console.log('generateQR called');
		
		if (!this.validateForm()) {
			console.log('Form validation failed');
			return;
		}

		// Check if QRCode library is available
		if (typeof QRCode === 'undefined') {
			console.error('QRCode library not available');
			this.showToast('error', 'Error: Librería QR no cargada. Intentando cargar...');
			
			// Intentar cargar la librería dinámicamente
			await this.loadQRCodeLibrary();
			
			if (typeof QRCode === 'undefined') {
				this.showToast('error', 'Error: No se pudo cargar la librería QR. Verifica tu conexión a internet.');
				return;
			}
		}

		console.log('QRCode library is available');

		this.showLoading(true);

		try {
			const formData = this.getFormData();
			console.log('Form data:', formData);
			
			const qrData = this.currentQRType.generate(formData);
			console.log('Generated QR data:', qrData);
			
			if (!qrData || qrData.trim() === '') {
				throw new Error('No se pudo generar los datos del QR');
			}
			
			const options = this.getQROptions();
			console.log('QR options:', options);
			
			const qrImage = await this.createQRCode(qrData, options);
			console.log('QR image generated successfully');
			
			this.generatedQR = {
				type: this.currentQRType.name,
				data: qrData,
				image: qrImage,
				timestamp: new Date().toISOString(),
				options: options
			};

			this.displayQR();
			this.saveToHistory();
			this.showToast('success', 'QR generado exitosamente');

		} catch (error) {
			console.error('Error generating QR:', error);
			this.showToast('error', `Error al generar el QR: ${error.message}`);
		} finally {
			this.showLoading(false);
		}
	}

	getQROptions() {
		const qrSize = document.getElementById('qrSize');
		const qrErrorLevel = document.getElementById('qrErrorLevel');
		const qrForeground = document.getElementById('qrForeground');
		const qrBackground = document.getElementById('qrBackground');
		const qrMargin = document.getElementById('qrMargin');
		
		const options = {
			size: qrSize ? parseInt(qrSize.value) : 256,
			errorCorrectionLevel: qrErrorLevel ? qrErrorLevel.value : 'M',
			foreground: qrForeground ? qrForeground.value : '#000000',
			background: qrBackground ? qrBackground.value : '#FFFFFF',
			margin: qrMargin ? parseInt(qrMargin.value) : 4
		};
		
		console.log('QR Options retrieved:', options);
		return options;
	}

	async createQRCode(data, options) {
		return new Promise((resolve, reject) => {
			try {
				// Check if QRCode library is available
				if (typeof QRCode === 'undefined') {
					reject(new Error('QRCode library not loaded'));
					return;
				}

				// Validate data
				if (!data || data.trim() === '') {
					reject(new Error('No data provided for QR code'));
					return;
				}

				console.log('Creating QR with options:', options);
				console.log('QRCode library type:', typeof QRCode);

				// Get all customization options with defaults
				const qrOptions = {
					width: options.size || 256,
					errorCorrectionLevel: options.errorCorrectionLevel || 'M',
					color: {
						dark: options.foreground || '#000000',
						light: options.background || '#FFFFFF'
					},
					margin: options.margin || 4
				};

				console.log('QR Options being applied:', qrOptions);

				// Add logo if available
				const logoImage = document.getElementById('logoImage');
				if (logoImage && logoImage.src && !logoImage.src.includes('data:,')) {
					qrOptions.logo = logoImage.src;
					qrOptions.logoWidth = Math.floor(qrOptions.width * 0.2);
					qrOptions.logoHeight = Math.floor(qrOptions.width * 0.2);
					console.log('Logo applied:', logoImage.src);
				}

				// Add gradient if enabled
				const gradientStart = document.getElementById('gradientStart')?.value;
				const gradientEnd = document.getElementById('gradientEnd')?.value;
				
				if (gradientStart && gradientEnd && gradientStart !== gradientEnd) {
					qrOptions.color = {
						dark: gradientStart,
						light: options.background || '#FFFFFF'
					};
					console.log('Gradient applied:', gradientStart, 'to', gradientEnd);
				}

				console.log('Final QR options:', qrOptions);

				// Try to generate QR with callback style first
				if (typeof QRCode.toDataURL === 'function') {
					QRCode.toDataURL(data, qrOptions, (err, url) => {
						if (err) {
							console.error('QRCode generation error:', err);
							reject(err);
						} else {
							console.log('QR generated successfully with callback');
							resolve(url);
						}
					});
				} else {
					// Fallback for non-callback style
					try {
						const url = QRCode.toDataURL(data, qrOptions);
						console.log('QR generated successfully without callback');
						resolve(url);
					} catch (error) {
						console.error('QRCode generation error (non-callback):', error);
						reject(error);
					}
				}
			} catch (error) {
				console.error('Error in createQRCode:', error);
				reject(error);
			}
		});
	}

	displayQR() {
		if (!this.generatedQR) return;

		const preview = document.getElementById('qrPreview');
		const info = document.getElementById('qrInfo');
		const downloadBtn = document.getElementById('downloadBtn');
		const shareBtn = document.getElementById('shareBtn');

		preview.innerHTML = `<img src="${this.generatedQR.image}" alt="QR Code" class="qr-image">`;

		document.getElementById('qrTypeInfo').textContent = this.generatedQR.type;
		document.getElementById('qrSizeInfo').textContent = `${this.generatedQR.options.size}x${this.generatedQR.options.size}`;
		document.getElementById('qrErrorInfo').textContent = this.generatedQR.options.errorCorrectionLevel;
		info.style.display = 'block';

		downloadBtn.disabled = false;
		shareBtn.disabled = false;
	}

	// Download QR
	downloadQR() {
		if (!this.generatedQR) return;

		const link = document.createElement('a');
		link.download = `qr-${this.currentQRType.id}-${Date.now()}.png`;
		link.href = this.generatedQR.image;
		link.click();
	}

	// Share QR
	async shareQR() {
		if (!this.generatedQR) return;

		if (navigator.share) {
			try {
				const response = await fetch(this.generatedQR.image);
				const blob = await response.blob();
				const file = new File([blob], 'qr-code.png', { type: 'image/png' });

				await navigator.share({
					title: 'QR Code',
					text: `QR generado: ${this.currentQRType.name}`,
					files: [file]
				});
			} catch (error) {
				console.error('Error sharing:', error);
				this.showToast('error', 'Error al compartir');
			}
		} else {
			this.copyToClipboard(this.generatedQR.data);
		}
	}

	async copyToClipboard(text) {
		try {
			await navigator.clipboard.writeText(text);
			this.showToast('success', 'Copiado al portapapeles');
		} catch (error) {
			console.error('Error copying to clipboard:', error);
			this.showToast('error', 'Error al copiar');
		}
	}

	// History Management
	saveToHistory() {
		if (!this.generatedQR) return;

		const historyItem = {
			...this.generatedQR,
			id: Date.now().toString()
		};

		this.history.unshift(historyItem);
		
		if (this.history.length > 20) {
			this.history = this.history.slice(0, 20);
		}

		this.saveHistory();
	}

	loadHistory() {
		try {
			const saved = localStorage.getItem('qr-history');
			return saved ? JSON.parse(saved) : [];
		} catch (error) {
			console.error('Error loading history:', error);
			return [];
		}
	}

	saveHistory() {
		try {
			localStorage.setItem('qr-history', JSON.stringify(this.history));
		} catch (error) {
			console.error('Error saving history:', error);
		}
	}

	// Theme Management
	loadTheme() {
		const savedTheme = localStorage.getItem('theme') || 'light';
		document.documentElement.setAttribute('data-theme', savedTheme);
	}

	toggleTheme() {
		const currentTheme = document.documentElement.getAttribute('data-theme');
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
		
		document.documentElement.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
	}

	// Loading State
	showLoading(show) {
		const overlay = document.getElementById('loadingOverlay');
		if (overlay) {
			overlay.style.display = show ? 'flex' : 'none';
		}
	}

	// Toast Notifications
	showToast(type, message) {
		const container = document.getElementById('toastContainer');
		if (!container) return;

		const toast = document.createElement('div');
		toast.className = `toast ${type}`;
		toast.innerHTML = `
			<div class="toast-header">
				<span class="toast-title">${this.getToastTitle(type)}</span>
				<button class="toast-close" onclick="this.parentElement.parentElement.remove()">
					<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
						<path d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
			</div>
			<div class="toast-message">${message}</div>
		`;

		container.appendChild(toast);

		setTimeout(() => {
			if (toast.parentElement) {
				toast.remove();
			}
		}, 5000);
	}

	getToastTitle(type) {
		switch (type) {
			case 'success': return 'Éxito';
			case 'error': return 'Error';
			case 'warning': return 'Advertencia';
			case 'info': return 'Información';
			default: return 'Notificación';
		}
	}

	// Event Binding
	bindEvents() {
		document.getElementById('qrForm')?.addEventListener('submit', (e) => {
			e.preventDefault();
			this.generateQR();
		});

		document.getElementById('previewBtn')?.addEventListener('click', () => {
			this.generateQR();
		});

		document.getElementById('generateBtn')?.addEventListener('click', (e) => {
			e.preventDefault();
			this.generateQR();
		});

		document.getElementById('closeForm')?.addEventListener('click', () => {
			this.hideGeneratorForm();
		});

		document.getElementById('downloadBtn')?.addEventListener('click', () => {
			this.downloadQR();
		});

		document.getElementById('shareBtn')?.addEventListener('click', () => {
			this.shareQR();
		});

		document.getElementById('themeToggle')?.addEventListener('click', () => {
			this.toggleTheme();
		});

		document.getElementById('qrMargin')?.addEventListener('input', (e) => {
			document.getElementById('qrMarginValue').textContent = e.target.value;
		});

		// Customization tabs
		this.setupCustomizationTabs();
		
		// Color picker sync
		this.setupColorPickers();
		
		// Logo upload
		this.setupLogoUpload();
		
		// Customization actions
		document.getElementById('resetCustomization')?.addEventListener('click', () => {
			this.resetCustomization();
		});

		document.getElementById('applyCustomization')?.addEventListener('click', () => {
			this.applyCustomization();
		});

		// Donation buttons
		this.setupDonationButtons();
		
		// Set current year
		this.setCurrentYear();
	}

	// Setup customization tabs
	setupCustomizationTabs() {
		const tabBtns = document.querySelectorAll('.tab-btn');
		const tabContents = document.querySelectorAll('.tab-content');

		tabBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				const tabName = btn.dataset.tab;
				
				// Remove active class from all tabs
				tabBtns.forEach(b => b.classList.remove('active'));
				tabContents.forEach(c => c.classList.remove('active'));
				
				// Add active class to clicked tab
				btn.classList.add('active');
				document.getElementById(`${tabName}-tab`).classList.add('active');
			});
		});
	}

	// Setup color pickers
	setupColorPickers() {
		const foregroundPicker = document.getElementById('qrForeground');
		const foregroundText = document.getElementById('qrForegroundText');
		const backgroundPicker = document.getElementById('qrBackground');
		const backgroundText = document.getElementById('qrBackgroundText');

		// Sync color picker with text input
		foregroundPicker?.addEventListener('input', (e) => {
			foregroundText.value = e.target.value;
		});

		foregroundText?.addEventListener('input', (e) => {
			if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
				foregroundPicker.value = e.target.value;
			}
		});

		backgroundPicker?.addEventListener('input', (e) => {
			backgroundText.value = e.target.value;
		});

		backgroundText?.addEventListener('input', (e) => {
			if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
				backgroundPicker.value = e.target.value;
			}
		});
	}

	// Setup logo upload
	setupLogoUpload() {
		const fileUploadArea = document.getElementById('fileUploadArea');
		const logoUpload = document.getElementById('logoUpload');
		const logoPreview = document.getElementById('logoPreview');
		const logoImage = document.getElementById('logoImage');
		const removeLogo = document.getElementById('removeLogo');

		// Drag and drop
		fileUploadArea?.addEventListener('dragover', (e) => {
			e.preventDefault();
			fileUploadArea.classList.add('dragover');
		});

		fileUploadArea?.addEventListener('dragleave', () => {
			fileUploadArea.classList.remove('dragover');
		});

		fileUploadArea?.addEventListener('drop', (e) => {
			e.preventDefault();
			fileUploadArea.classList.remove('dragover');
			const files = e.dataTransfer.files;
			if (files.length > 0) {
				this.handleLogoFile(files[0]);
			}
		});

		// File input change
		logoUpload?.addEventListener('change', (e) => {
			if (e.target.files.length > 0) {
				this.handleLogoFile(e.target.files[0]);
			}
		});

		// Remove logo
		removeLogo?.addEventListener('click', () => {
			logoUpload.value = '';
			logoPreview.style.display = 'none';
			fileUploadArea.style.display = 'block';
		});
	}

	// Handle logo file
	handleLogoFile(file) {
		if (!file.type.startsWith('image/')) {
			this.showToast('error', 'Por favor selecciona un archivo de imagen válido');
			return;
		}

		if (file.size > 2 * 1024 * 1024) { // 2MB limit
			this.showToast('error', 'El archivo es demasiado grande. Máximo 2MB');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const logoImage = document.getElementById('logoImage');
			const logoPreview = document.getElementById('logoPreview');
			const fileUploadArea = document.getElementById('fileUploadArea');

			logoImage.src = e.target.result;
			logoPreview.style.display = 'block';
			fileUploadArea.style.display = 'none';
		};
		reader.readAsDataURL(file);
	}

	// Reset customization
	resetCustomization() {
		document.getElementById('qrSize').value = '256';
		document.getElementById('qrErrorLevel').value = 'M';
		document.getElementById('qrForeground').value = '#000000';
		document.getElementById('qrForegroundText').value = '#000000';
		document.getElementById('qrBackground').value = '#FFFFFF';
		document.getElementById('qrBackgroundText').value = '#FFFFFF';
		document.getElementById('qrMargin').value = '4';
		document.getElementById('qrMarginValue').textContent = '4';
		document.getElementById('qrStyle').value = 'square';
		document.getElementById('gradientStart').value = '#2563eb';
		document.getElementById('gradientEnd').value = '#1d4ed8';
		document.getElementById('gradientDirection').value = 'horizontal';

		// Reset logo
		document.getElementById('logoUpload').value = '';
		document.getElementById('logoPreview').style.display = 'none';
		document.getElementById('fileUploadArea').style.display = 'block';

		this.showToast('success', 'Personalización restablecida');
	}

	// Apply customization
	applyCustomization() {
		if (this.generatedQR) {
			this.generateQR(); // Regenerate with new settings
		}
		this.showToast('success', 'Cambios aplicados');
	}

	// Setup donation buttons
	setupDonationButtons() {
		const donationBtns = document.querySelectorAll('.donation-btn');
		
		donationBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				const crypto = btn.dataset.crypto;
				this.showDonationInfo(crypto);
			});
		});
	}

	// Show donation info
	showDonationInfo(crypto) {
		const addresses = {
			bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
			monero: '4A1Vp94pK9qE2qMqLQmVL7Q6Y7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4',
			ethereum: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
		};

		const address = addresses[crypto];
		if (address) {
			const message = `Dirección ${crypto.charAt(0).toUpperCase() + crypto.slice(1)}: ${address}`;
			this.showToast('info', message);
		} else {
			this.showToast('error', 'Criptomoneda no soportada');
		}
	}

	// Load QRCode library dynamically
	async loadQRCodeLibrary() {
		return new Promise((resolve) => {
			const script = document.createElement('script');
			script.src = 'https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js';
			script.onload = () => {
				console.log('QRCode library loaded dynamically');
				resolve();
			};
			script.onerror = () => {
				console.log('QRCode library failed to load dynamically, using fallback');
				resolve();
			};
			document.head.appendChild(script);
		});
	}

	// Set current year
	setCurrentYear() {
		const yearSpan = document.getElementById('currentYear');
		if (yearSpan) {
			yearSpan.textContent = new Date().getFullYear();
		}
	}
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	window.qrApp = new QRGeneratorApp();
});
