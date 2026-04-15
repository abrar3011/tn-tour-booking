document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    if (path.includes('submit.html') || path.includes('payment.html')) {
        const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');
        if (!bookingData.destination) {
            window.location.href = 'booking.html';
            return;
        }
    }
    
    initTheme();
    initMobileMenu();
    initScrollAnimations();
    initSelectionCards();
    initPaymentMethods();
    initBookingForm();
    loadBookingData();
    initSmoothScroll();
    initCounterAnimation();
    initParallax();
    initDistanceCalculation();
});

function initDistanceCalculation() {
    const pickupSelect = document.getElementById('pickupLocation');
    const destinationCards = document.querySelectorAll('#locationSelect .selection-card');
    const distanceInput = document.getElementById('distance');
    const otherLocationGroup = document.getElementById('otherLocationGroup');
    
    if (!pickupSelect || !distanceInput) return;
    
    if (pickupSelect) {
        pickupSelect.addEventListener('change', function() {
            const pickup = this.value;
            if (pickup === 'other') {
                if (otherLocationGroup) otherLocationGroup.style.display = 'block';
                if (distanceInput) {
                    distanceInput.removeAttribute('readonly');
                    distanceInput.placeholder = 'Enter distance in KM';
                    distanceInput.required = true;
                }
            } else {
                if (otherLocationGroup) otherLocationGroup.style.display = 'none';
                calculateDistance();
            }
        });
    }
    
    destinationCards.forEach(card => {
        card.addEventListener('click', function() {
            calculateDistance();
        });
    });
    
    function calculateDistance() {
        const pickup = pickupSelect.value;
        let destination = '';
        
        const selectedDest = document.querySelector('#locationSelect .selection-card.selected');
        if (selectedDest) {
            destination = selectedDest.dataset.value;
        }
        
        if (pickup && pickup !== 'other' && destination) {
            const distance = getDistance(pickup, destination);
            if (distanceInput) {
                distanceInput.value = distance;
                distanceInput.setAttribute('readonly', true);
            }
            
            if (typeof updatePriceSummary === 'function') {
                updatePriceSummary();
            }
        }
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            showToast('success', 'Theme Changed', `Switched to ${newTheme} mode`);
        });
    }
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('header');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }
    
    window.addEventListener('scroll', function() {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

function initSelectionCards() {
    const selectionCards = document.querySelectorAll('.selection-card');
    
    selectionCards.forEach(card => {
        card.addEventListener('click', function() {
            const parent = this.parentElement;
            const cards = parent.querySelectorAll('.selection-card');
            cards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            const input = parent.querySelector('input[type="hidden"]');
            if (input) {
                input.value = this.dataset.value;
            }
            
            if (typeof updatePriceSummary === 'function') {
                updatePriceSummary();
            }
        });
    });
}

function initPaymentMethods() {
    const methodOptions = document.querySelectorAll('.method-option');
    
    methodOptions.forEach(option => {
        option.addEventListener('click', function() {
            methodOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            
            const method = this.dataset.method;
            
            document.getElementById('cardForm').style.display = 'none';
            document.getElementById('upiForm').style.display = 'none';
            document.getElementById('netbankingForm').style.display = 'none';
            document.getElementById('walletForm').style.display = 'none';
            
            const formToShow = method + 'Form';
            const form = document.getElementById(formToShow);
            if (form) {
                form.style.display = 'block';
                form.classList.add('fade-in');
            }
        });
    });
}

const pricingData = {
    destinations: {
        madurai: { base: 1000, hotel: { standard: 1500, '3star': 1500, resort: 10000 } },
        chennai: { base: 1000, hotel: { standard: 1500, '3star': 1500, resort: 10000 } },
        thanjavur: { base: 1000, hotel: { standard: 1500, '3star': 1500, resort: 10000 } },
        rameshwaram: { base: 1000, hotel: { standard: 1500, '3star': 1500, resort: 10000 } },
        kanyakumari: { base: 1000, hotel: { standard: 1500, '3star': 1500, resort: 10000 } },
        pondicherry: { base: 1000, hotel: { standard: 1500, '3star': 1500, resort: 10000 } },
        mahabalipuram: { base: 1000, hotel: { standard: 1500, '3star': 1500, resort: 10000 } },
        ooty: { base: 1000, hotel: { standard: 1500, '3star': 1500, resort: 10000 } },
        kodaikanal: { base: 1000, hotel: { standard: 1500, '3star': 1500, resort: 10000 } }
    },
    food: {
        veg: 300,
        nonveg: 400
    },
    bus: {
        standard: { price: 1000, capacity: 40 },
        premium: { price: 2000, capacity: 20 }
    },
    guide: 500,
    vehicleFare: {
        under100: 15000,
        under300: 25000,
        under500: 35000
    },
    distances: {
        chennai: { madurai: 450, thanjavur: 350, rameshwaram: 500, kanyakumari: 680, pondicherry: 150, mahabalipuram: 50, ooty: 530, kodaikanal: 520, coimbatore: 430, trichy: 320, salem: 350, tirunelveli: 600, vellore: 130, dindigul: 420, tiruppur: 450, erode: 400, tiruchirappalli: 320, nagapattinam: 400, namakkal: 350, karur: 300, perambalur: 320, ariyalur: 330, sivaganga: 380, virudhunagar: 450, ramanathapuram: 450, theni: 300, kanyakumari: 680 },
        madurai: { chennai: 450, thanjavur: 180, rameshwaram: 140, kanyakumari: 230, pondicherry: 380, mahabalipuram: 400, ooty: 290, kodaikanal: 120, coimbatore: 160, trichy: 130, salem: 260, tirunelveli: 110, vellore: 350, dindigul: 60, tiruppur: 200, erode: 220, tiruchirappalli: 130, nagapattinam: 240, namakkal: 210, karur: 170, perambalur: 160, ariyalur: 170, sivaganga: 60, virudhunagar: 100, ramanathapuram: 130, theni: 70, kanyakumari: 230 },
        coimbatore: { madurai: 160, thanjavur: 280, rameshwaram: 300, kanyakumari: 550, pondicherry: 300, mahabalipuram: 310, ooty: 180, kodaikanal: 250, chennai: 430, trichy: 240, salem: 110, tirunelveli: 480, vellore: 330, dindigul: 200, tiruppur: 60, erode: 80, tiruchirappalli: 240, nagapattinam: 320, namakkal: 180, karur: 210, perambalur: 230, ariyalur: 240, sivaganga: 200, virudhunagar: 260, ramanathapuram: 290, theni: 170, kanyakumari: 550 },
        trichy: { madurai: 130, thanjavur: 60, rameshwaram: 210, kanyakumari: 380, pondicherry: 210, mahabalipuram: 280, ooty: 320, kodaikanal: 250, chennai: 320, coimbatore: 240, salem: 180, tirunelveli: 280, vellore: 270, dindigul: 170, tiruppur: 300, erode: 230, tiruchirappalli: 50, nagapattinam: 140, namakkal: 140, karur: 80, perambalur: 60, ariyalur: 70, sivaganga: 110, virudhunagar: 170, ramanathapuram: 200, theni: 190, kanyakumari: 380 },
        salem: { madurai: 260, thanjavur: 180, rameshwaram: 320, kanyakumari: 480, pondicherry: 240, mahabalipuram: 280, ooty: 220, kodaikanal: 320, chennai: 350, coimbatore: 110, trichy: 180, tirunelveli: 420, vellore: 220, dindigul: 280, tiruppur: 170, erode: 60, tiruchirappalli: 180, nagapattinam: 260, namakkal: 70, karur: 130, perambalur: 150, ariyalur: 160, sivaganga: 220, virudhunagar: 280, ramanathapuram: 310, theni: 230, kanyakumari: 480 },
        tirunelveli: { madurai: 110, thanjavur: 210, rameshwaram: 80, kanyakumari: 140, pondicherry: 380, mahabalipuram: 420, ooty: 400, kodaikanal: 230, chennai: 600, coimbatore: 480, trichy: 280, salem: 420, vellore: 550, dindigul: 150, tiruppur: 530, erode: 470, tiruchirappalli: 280, nagapattinam: 340, namakkal: 380, karur: 320, perambalur: 300, ariyalur: 290, sivaganga: 100, virudhunagar: 60, ramanathapuram: 90, theni: 50, kanyakumari: 140 },
        vellore: { madurai: 350, thanjavur: 250, rameshwaram: 400, kanyakumari: 580, pondicherry: 200, mahabalipuram: 100, ooty: 430, kodaikanal: 420, chennai: 130, coimbatore: 330, trichy: 270, salem: 220, tirunelveli: 550, dindigul: 380, tiruppur: 380, erode: 290, tiruchirappalli: 270, nagapattinam: 350, namakkal: 260, karur: 230, perambalur: 250, ariyalur: 260, sivaganga: 310, virudhunagar: 370, ramanathapuram: 400, theni: 300, kanyakumari: 580 },
        thanjavur: { madurai: 180, chennai: 350, rameshwaram: 220, kanyakumari: 380, pondicherry: 280, mahabalipuram: 320, ooty: 380, kodaikanal: 300, coimbatore: 280, trichy: 60, salem: 180, tirunelveli: 210, vellore: 250, dindigul: 120, tiruppur: 340, erode: 240, tiruchirappalli: 60, nagapattinam: 100, namakkal: 140, karur: 90, perambalur: 80, ariyalur: 90, sivaganga: 140, virudhunagar: 200, ramanathapuram: 230, theni: 160, kanyakumari: 380 },
        dindigul: { madurai: 60, thanjavur: 120, rameshwaram: 190, kanyakumari: 300, pondicherry: 330, mahabalipuram: 360, ooty: 240, kodaikanal: 100, chennai: 420, coimbatore: 200, trichy: 170, salem: 280, tirunelveli: 150, vellore: 380, dindigul: 60, tiruppur: 260, erode: 250, tiruchirappalli: 170, nagapattinam: 250, namakkal: 230, karur: 190, perambalur: 180, ariyalur: 190, sivaganga: 80, virudhunagar: 140, ramanathapuram: 170, theni: 110, kanyakumari: 300 },
        tiruppur: { madurai: 200, thanjavur: 340, rameshwaram: 360, kanyakumari: 600, pondicherry: 320, mahabalipuram: 320, ooty: 120, kodaikanal: 300, chennai: 450, coimbatore: 60, trichy: 300, salem: 170, tirunelveli: 530, vellore: 380, dindigul: 260, tiruppur: 60, erode: 40, tiruchirappalli: 300, nagapattinam: 380, namakkal: 210, karur: 250, perambalur: 270, ariyalur: 280, sivaganga: 250, virudhunagar: 310, ramanathapuram: 340, theni: 220, kanyakumari: 600 },
        erode: { madurai: 220, thanjavur: 240, rameshwaram: 300, kanyakumari: 500, pondicherry: 270, mahabalipuram: 290, ooty: 150, kodaikanal: 280, chennai: 400, coimbatore: 80, trichy: 230, salem: 60, tirunelveli: 470, vellore: 290, dindigul: 250, tiruppur: 40, erode: 60, tiruchirappalli: 230, nagapattinam: 310, namakkal: 100, karur: 180, perambalur: 200, ariyalur: 210, sivaganga: 190, virudhunagar: 250, ramanathapuram: 280, theni: 200, kanyakumari: 500 },
        tiruchirappalli: { madurai: 130, thanjavur: 60, rameshwaram: 210, kanyakumari: 380, pondicherry: 210, mahabalipuram: 280, ooty: 320, kodaikanal: 250, chennai: 320, coimbatore: 240, trichy: 50, salem: 180, tirunelveli: 280, vellore: 270, dindigul: 170, tiruppur: 300, erode: 230, tiruchirappalli: 50, nagapattinam: 140, namakkal: 140, karur: 80, perambalur: 60, ariyalur: 70, sivaganga: 110, virudhunagar: 170, ramanathapuram: 200, theni: 190, kanyakumari: 380 },
        nagapattinam: { madurai: 240, thanjavur: 100, rameshwaram: 180, kanyakumari: 320, pondicherry: 280, mahabalipuram: 320, ooty: 380, kodaikanal: 300, chennai: 350, coimbatore: 320, trichy: 140, salem: 260, tirunelveli: 340, vellore: 350, dindigul: 250, tiruppur: 380, erode: 310, tiruchirappalli: 140, nagapattinam: 100, namakkal: 200, karur: 150, perambalur: 130, ariyalur: 120, sivaganga: 180, virudhunagar: 240, ramanathapuram: 270, theni: 200, kanyakumari: 320 },
        namakkal: { madurai: 210, thanjavur: 140, rameshwaram: 260, kanyakumari: 420, pondicherry: 230, mahabalipuram: 260, ooty: 200, kodaikanal: 270, chennai: 350, coimbatore: 180, trichy: 140, salem: 70, tirunelveli: 380, vellore: 260, dindigul: 230, tiruppur: 210, erode: 100, tiruchirappalli: 140, nagapattinam: 200, namakkal: 70, karur: 100, perambalur: 120, ariyalur: 130, sivaganga: 160, virudhunagar: 220, ramanathapuram: 250, theni: 180, kanyakumari: 420 },
        karur: { madurai: 170, thanjavur: 90, rameshwaram: 200, kanyakumari: 350, pondicherry: 200, mahabalipuram: 250, ooty: 260, kodaikanal: 230, chennai: 300, coimbatore: 210, trichy: 80, salem: 130, tirunelveli: 320, vellore: 230, dindigul: 190, tiruppur: 250, erode: 180, tiruchirappalli: 80, nagapattinam: 150, namakkal: 100, karur: 80, perambalur: 60, ariyalur: 70, sivaganga: 120, virudhunagar: 180, ramanathapuram: 210, theni: 170, kanyakumari: 350 },
        perambalur: { madurai: 160, thanjavur: 80, rameshwaram: 200, kanyakumari: 360, pondicherry: 210, mahabalipuram: 260, ooty: 270, kodaikanal: 240, chennai: 320, coimbatore: 230, trichy: 60, salem: 150, tirunelveli: 300, vellore: 250, dindigul: 180, tiruppur: 270, erode: 200, tiruchirappalli: 60, nagapattinam: 130, namakkal: 120, karur: 60, perambalur: 60, ariyalur: 40, sivaganga: 100, virudhunagar: 160, ramanathapuram: 190, theni: 160, kanyakumari: 360 },
        ariyalur: { madurai: 170, thanjavur: 90, rameshwaram: 210, kanyakumari: 370, pondicherry: 220, mahabalipuram: 270, ooty: 280, kodaikanal: 250, chennai: 330, coimbatore: 240, trichy: 70, salem: 160, tirunelveli: 290, vellore: 260, dindigul: 190, tiruppur: 280, erode: 210, tiruchirappalli: 70, nagapattinam: 120, namakkal: 130, karur: 70, perambalur: 40, ariyalur: 50, sivaganga: 110, virudhunagar: 170, ramanathapuram: 200, theni: 170, kanyakumari: 370 },
        sivaganga: { madurai: 60, thanjavur: 140, rameshwaram: 100, kanyakumari: 250, pondicherry: 350, mahabalipuram: 370, ooty: 280, kodaikanal: 150, chennai: 380, coimbatore: 200, trichy: 110, salem: 220, tirunelveli: 100, vellore: 310, dindigul: 80, tiruppur: 250, erode: 190, tiruchirappalli: 110, nagapattinam: 180, namakkal: 160, karur: 120, perambalur: 100, ariyalur: 110, sivaganga: 60, virudhunagar: 80, ramanathapuram: 70, theni: 40, kanyakumari: 250 },
        virudhunagar: { madurai: 100, thanjavur: 200, rameshwaram: 110, kanyakumari: 200, pondicherry: 370, mahabalipuram: 390, ooty: 330, kodaikanal: 200, chennai: 450, coimbatore: 260, trichy: 170, salem: 280, tirunelveli: 60, vellore: 370, dindigul: 140, tiruppur: 310, erode: 250, tiruchirappalli: 170, nagapattinam: 240, namakkal: 220, karur: 180, perambalur: 160, ariyalur: 170, sivaganga: 80, virudhunagar: 60, ramanathapuram: 50, theni: 50, kanyakumari: 200 },
        ramanathapuram: { madurai: 130, thanjavur: 230, rameshwaram: 50, kanyakumari: 150, pondicherry: 380, mahabalipuram: 400, ooty: 360, kodaikanal: 210, chennai: 450, coimbatore: 290, trichy: 200, salem: 310, tirunelveli: 90, vellore: 400, dindigul: 170, tiruppur: 340, erode: 280, tiruchirappalli: 200, nagapattinam: 270, namakkal: 250, karur: 210, perambalur: 190, ariyalur: 200, sivaganga: 70, virudhunagar: 50, ramanathapuram: 50, theni: 90, kanyakumari: 150 },
        theni: { madurai: 70, thanjavur: 160, rameshwaram: 100, kanyakumari: 200, pondicherry: 340, mahabalipuram: 360, ooty: 230, kodaikanal: 120, chennai: 430, coimbatore: 170, trichy: 190, salem: 230, tirunelveli: 50, vellore: 300, dindigul: 110, tiruppur: 220, erode: 200, tiruchirappalli: 190, nagapattinam: 200, namakkal: 180, karur: 170, perambalur: 160, ariyalur: 170, sivaganga: 40, virudhunagar: 50, ramanathapuram: 90, theni: 50, kanyakumari: 200 },
        kanyakumari: { madurai: 230, thanjavur: 380, rameshwaram: 150, kanyakumari: 100, pondicherry: 450, mahabalipuram: 470, ooty: 430, kodaikanal: 250, chennai: 680, coimbatore: 550, trichy: 380, salem: 480, tirunelveli: 140, vellore: 580, dindigul: 300, tiruppur: 600, erode: 500, tiruchirappalli: 380, nagapattinam: 320, namakkal: 420, karur: 350, perambalur: 360, ariyalur: 370, sivaganga: 250, virudhunagar: 200, ramanathapuram: 150, theni: 200, kanyakumari: 100 },
        pondicherry: { madurai: 380, thanjavur: 280, rameshwaram: 400, kanyakumari: 450, pondicherry: 150, mahabalipuram: 120, ooty: 400, kodaikanal: 380, chennai: 150, coimbatore: 300, trichy: 210, salem: 240, tirunelveli: 380, vellore: 200, dindigul: 330, tiruppur: 320, erode: 270, tiruchirappalli: 210, nagapattinam: 280, namakkal: 230, karur: 200, perambalur: 210, ariyalur: 220, sivaganga: 350, virudhunagar: 370, ramanathapuram: 400, theni: 340, kanyakumari: 450 }
    }
};

function getDistance(pickup, destination) {
    if (!pickup || !destination) return 0;
    pickup = pickup.toLowerCase();
    destination = destination.toLowerCase();
    if (pricingData.distances[pickup] && pricingData.distances[pickup][destination]) {
        return pricingData.distances[pickup][destination];
    }
    return 0;
}

function calculateVehicleFare(distance) {
    if (distance <= 0) return 0;
    if (distance <= 100) return 15000;
    if (distance <= 300) return 25000;
    if (distance <= 500) return 35000;
    return 35000 + ((distance - 500) * 50);
}

function calculatePrice() {
    const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');
    
    let total = 0;
    let tourPackage = 0;
    let hotelCost = 0;
    let foodCost = 0;
    let busFare = 0;
    let extraBusCost = 0;
    let numBuses = 1;
    let vehicleFare = 0;
    let guideCost = 0;
    let busType = bookingData.bus || 'standard';
    let busCapacity = pricingData.bus[busType]?.capacity || 40;
    
    if (bookingData.destination && pricingData.destinations[bookingData.destination]) {
        tourPackage = pricingData.destinations[bookingData.destination].base;
        
        if (bookingData.hotel && pricingData.destinations[bookingData.destination].hotel[bookingData.hotel]) {
            hotelCost = pricingData.destinations[bookingData.destination].hotel[bookingData.hotel];
        }
    }
    
    if (bookingData.food && pricingData.food[bookingData.food]) {
        foodCost = pricingData.food[bookingData.food];
    }
    
    if (bookingData.bus && pricingData.bus[bookingData.bus]) {
        busFare = pricingData.bus[bookingData.bus].price;
    }
    
    let nights = 2;
    if (bookingData.checkin && bookingData.checkout) {
        const checkin = new Date(bookingData.checkin);
        const checkout = new Date(bookingData.checkout);
        nights = Math.max(1, Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24)));
    }
    
    let guests = parseInt(bookingData.guests) || 1;
    if (guests > busCapacity) {
        numBuses = Math.ceil(guests / busCapacity);
        extraBusCost = (numBuses - 1) * busFare * nights;
    }
    
    let rooms = Math.ceil(guests / 5);
    let hotelCostPerRoom = hotelCost;
    let hotelCostPerNight = hotelCost * rooms;
    
    let distance = parseInt(bookingData.distance) || 0;
    if (distance > 0) {
        distance = distance * 2;
        vehicleFare = calculateVehicleFare(distance);
    }
    
    guideCost = pricingData.guide * nights;
    
    const tourTotal = tourPackage * nights;
    const busTotal = (busFare * numBuses) * nights;
    const foodTotal = foodCost * guests * nights;
    const hotelTotal = hotelCostPerNight * nights;
    const totalTourPrice = hotelTotal + busTotal + foodTotal + vehicleFare;
    const gst = Math.round(totalTourPrice * 0.05);
    total = totalTourPrice + gst;
    
    return {
        tourPackage: tourTotal,
        tourPackagePerDay: tourPackage,
        hotelCost: hotelTotal,
        hotelCostPerDay: hotelCostPerNight,
        hotelCostPerRoom: hotelCostPerRoom,
        roomsRequired: rooms,
        guestsPerRoom: 5,
        busFare: busTotal,
        busFarePerDay: busFare,
        extraBusCost,
        numBuses,
        foodCost: foodTotal,
        foodCostPerDay: foodCost,
        vehicleFare,
        guideCost,
        guideCostPerDay: pricingData.guide,
        gst,
        total,
        totalTourPrice,
        distance,
        nights
    };
}

function updatePriceSummary() {
    const price = calculatePrice();
    const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');
    
    const hotelEl = document.getElementById('summaryHotelCost');
    const busEl = document.getElementById('summaryBusCost');
    const foodEl = document.getElementById('summaryFoodCost');
    const taxesEl = document.getElementById('summaryTaxes');
    const totalEl = document.getElementById('summaryTotal');
    const distanceEl = document.getElementById('summaryDistance');
    
    if (distanceEl) {
        const originalDistance = Math.floor((parseInt(bookingData.distance) || 0));
        const roundTrip = originalDistance * 2;
        distanceEl.textContent = originalDistance > 0 ? originalDistance + ' KM (One Way) / ' + roundTrip + ' KM (Round Trip)' : '--';
    }
    
    if (hotelEl) {
        hotelEl.textContent = '₹' + price.hotelCost.toLocaleString('en-IN');
    }
    
    const totalVehicleCost = price.busFare + price.vehicleFare;
    if (busEl) busEl.textContent = '₹' + totalVehicleCost.toLocaleString('en-IN');
    
    if (foodEl) foodEl.textContent = '₹' + price.foodCost.toLocaleString('en-IN');
    if (taxesEl) taxesEl.textContent = '₹' + price.gst.toLocaleString('en-IN');
    if (totalEl) totalEl.textContent = '₹' + price.total.toLocaleString('en-IN');
}

function initBookingForm() {
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const destination = document.querySelector('#locationSelect .selection-card.selected');
            const hotel = document.querySelector('#hotelSelect .selection-card.selected');
            const food = document.querySelector('#foodSelect .selection-card.selected');
            const bus = document.querySelector('#busSelect .selection-card.selected');
            
            if (!destination) {
                showToast('error', 'Selection Required', 'Please select a destination');
                document.getElementById('locationSelect')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            
            if (!hotel) {
                showToast('error', 'Selection Required', 'Please select a hotel type');
                document.getElementById('hotelSelect')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            
            if (!food) {
                showToast('error', 'Selection Required', 'Please select a food type');
                document.getElementById('foodSelect')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            
            if (!bus) {
                showToast('error', 'Selection Required', 'Please select a bus type');
                document.getElementById('busSelect')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            
            const checkin = document.getElementById('checkin').value;
            const checkout = document.getElementById('checkout').value;
            
            if (checkin && checkout) {
                const checkinDate = new Date(checkin);
                const checkoutDate = new Date(checkout);
                
                if (checkoutDate <= checkinDate) {
                    showToast('error', 'Invalid Dates', 'Check-out date must be after check-in date');
                    return;
                }
            }
            
            const bookingData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                pickupLocation: document.getElementById('pickupLocation').value === 'other' ? document.getElementById('otherLocation').value : document.getElementById('pickupLocation').value,
                pickupAddress: document.getElementById('pickupAddress').value,
                distance: document.getElementById('distance').value,
                guests: document.getElementById('guests').value,
                destination: destination.dataset.value,
                checkin: checkin,
                checkout: checkout,
                hotel: hotel.dataset.value,
                food: food.dataset.value,
                bus: bus.dataset.value,
                requests: document.getElementById('requests').value
            };
            
            localStorage.setItem('bookingData', JSON.stringify(bookingData));
            
            showToast('success', 'Booking Details Saved', 'Redirecting to submit page...');
            
            setTimeout(() => {
                window.location.href = 'submit.html';
            }, 1500);
        });
    }
}

function loadBookingData() {
    const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');
    
    if (bookingData.destination) {
        const summaryDest = document.getElementById('summaryDestination');
        if (summaryDest) {
            const destinationNames = {
                madurai: 'Madurai',
                chennai: 'Chennai',
                thanjavur: 'Thanjavur',
                rameshwaram: 'Rameshwaram',
                kanyakumari: 'Kanyakumari',
                pondicherry: 'Pondicherry',
                mahabalipuram: 'Mahabalipuram',
                ooty: 'Ooty',
                kodaikanal: 'Kodaikanal'
            };
            summaryDest.textContent = destinationNames[bookingData.destination] || bookingData.destination;
            
            const destCards = document.querySelectorAll('#locationSelect .selection-card');
            destCards.forEach(card => {
                if (card.dataset.value === bookingData.destination) {
                    card.classList.add('selected');
                }
            });
        }
    }
    
    if (bookingData.pickupLocation) {
        const summaryPickup = document.getElementById('summaryPickupLocation');
        if (summaryPickup) {
            let pickupText = bookingData.pickupLocation;
            if (bookingData.pickupAddress) {
                pickupText += ', ' + bookingData.pickupAddress.substring(0, 30) + (bookingData.pickupAddress.length > 30 ? '...' : '');
            }
            summaryPickup.textContent = pickupText;
        }
    }
    
    if (bookingData.guests) {
        const summaryGuests = document.getElementById('summaryGuests');
        if (summaryGuests) {
            summaryGuests.textContent = bookingData.guests + ' Guest' + (bookingData.guests > 1 ? 's' : '');
        }
    }
    
    if (bookingData.hotel) {
        const summaryHotel = document.getElementById('summaryHotel');
        if (summaryHotel) {
            let hotelNames = {
                standard: 'Standard',
                '3star': 'Star Hotel',
                resort: 'Resort'
            };
            summaryHotel.textContent = hotelNames[bookingData.hotel] || bookingData.hotel;
        }
        
        const hotelCards = document.querySelectorAll('#hotelSelect .selection-card');
        hotelCards.forEach(card => {
            if (card.dataset.value === bookingData.hotel) {
                card.classList.add('selected');
            }
        });
    }
    
    if (bookingData.food) {
        const summaryFood = document.getElementById('summaryFood');
        if (summaryFood) {
            let foodNames = {
                veg: 'Veg',
                nonveg: 'Non-Veg'
            };
            summaryFood.textContent = foodNames[bookingData.food] || bookingData.food;
        }
        
        const foodCards = document.querySelectorAll('#foodSelect .selection-card');
        foodCards.forEach(card => {
            if (card.dataset.value === bookingData.food) {
                card.classList.add('selected');
            }
        });
    }
    
    if (bookingData.bus) {
        const summaryBus = document.getElementById('summaryBus');
        if (summaryBus) {
            let busNames = {
                standard: 'Standard A/C',
                premium: 'Premium A/C'
            };
            summaryBus.textContent = busNames[bookingData.bus] || bookingData.bus;
        }
        
        const busCards = document.querySelectorAll('#busSelect .selection-card');
        busCards.forEach(card => {
            if (card.dataset.value === bookingData.bus) {
                card.classList.add('selected');
            }
        });
    }
    
    if (bookingData.checkin && bookingData.checkout) {
        const checkin = new Date(bookingData.checkin);
        const checkout = new Date(bookingData.checkout);
        const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
        
        const summaryDuration = document.getElementById('summaryDuration');
        if (summaryDuration) {
            summaryDuration.textContent = nights + ' Night' + (nights > 1 ? 's' : '');
        }
        
        const summaryDates = document.getElementById('summaryDates');
        if (summaryDates) {
            const checkinStr = checkin.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const checkoutStr = checkout.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            summaryDates.textContent = checkinStr + ' - ' + checkoutStr;
        }
    }
    
    updatePriceSummary();
}

function processPayment() {
    const methodOption = document.querySelector('.method-option.selected');
    if (!methodOption) {
        showToast('error', 'Payment Required', 'Please select a payment method');
        return;
    }
    
    const method = methodOption.dataset.method;
    
    if (method === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardName = document.getElementById('cardName').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;
        
        if (!cardNumber || !cardName || !expiry || !cvv) {
            showToast('error', 'Missing Details', 'Please fill in all card details');
            return;
        }
        
        if (cardNumber.replace(/\s/g, '').length < 16) {
            showToast('error', 'Invalid Card', 'Please enter a valid card number');
            return;
        }
    } else if (method === 'upi') {
        const upiId = document.getElementById('upiId').value;
        if (!upiId) {
            showToast('error', 'Missing UPI ID', 'Please enter your UPI ID');
            return;
        }
        
        if (!upiId.includes('@')) {
            showToast('error', 'Invalid UPI ID', 'Please enter a valid UPI ID');
            return;
        }
    } else if (method === 'netbanking') {
        const bank = document.getElementById('bank').value;
        if (!bank) {
            showToast('error', 'Bank Required', 'Please select a bank');
            return;
        }
    } else if (method === 'wallet') {
        const wallet = document.getElementById('wallet').value;
        if (!wallet) {
            showToast('error', 'Wallet Required', 'Please select a wallet');
            return;
        }
    }
    
    showToast('success', 'Payment Successful!', 'Your tour has been booked successfully!');
    
    const paymentData = {
        method: method,
        total: calculatePrice().total,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
    
    setTimeout(() => {
        window.location.href = 'confirmation.html';
    }, 3000);
}

function showToast(type, title, message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-message">
            <div class="toast-title">${title}</div>
            <div class="toast-text">${message}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current).toLocaleString();
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target.toLocaleString();
                    }
                };
                
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function initParallax() {
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            hero.style.backgroundPositionY = (scrolled * 0.5) + 'px';
        });
    }
}

window.formatCardNumber = function(input) {
    let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    input.value = formattedValue;
};

window.formatExpiry = function(input) {
    let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
        input.value = value.substring(0, 2) + '/' + value.substring(2, 4);
    } else {
        input.value = value;
    }
};

window.addEventListener('load', function() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.classList.add('hidden');
        setTimeout(() => loading.remove(), 500);
    }
});
