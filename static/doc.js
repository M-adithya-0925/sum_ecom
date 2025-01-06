const doctors = [
    { name: 'Dr. Smith', specialty: 'Cardiology', image: 'path/to/smith.jpg', rating: 4.8 },
    { name: 'Dr. Johnson', specialty: 'Pediatrics', image: 'path/to/johnson.jpg', rating: 4.9 },
    { name: 'Dr. Williams', specialty: 'Dermatology', image: 'path/to/williams.jpg', rating: 4.7 },
];
let selectedDoctor = null;

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    if (sectionId === 'doctorSelection') {
        renderDoctorCards();
    } else if (sectionId === 'dashboard') {
        renderHealthChart();
    }
}

function renderDoctorCards(doctorsToRender = doctors) {
    const doctorCards = document.getElementById('doctorCards');
    doctorCards.innerHTML = '';
    doctorsToRender.forEach((doctor, index) => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card doctor-card">
                <img src="${doctor.image}" class="card-img-top" alt="${doctor.name}">
                <div class="card-body">
                    <h5 class="card-title">${doctor.name}</h5>
                    <p class="card-text">${doctor.specialty}</p>
                    <p class="card-text"><small class="text-muted">Rating: ${doctor.rating}/5</small></p>
                    <button class="btn btn-primary animated-button" onclick="selectDoctor(${index})">Select</button>
                </div>
            </div>
        `;
        doctorCards.appendChild(card);
        setTimeout(() => card.style.opacity = 1, index * 100);
    });
}

function selectDoctor(index) {
    selectedDoctor = doctors[index];
    document.getElementById('selectedDoctor').innerHTML = `
        <p>Selected Doctor: ${selectedDoctor.name}</p>
        <p>Specialty: ${selectedDoctor.specialty}</p>
    `;
    showSection('booking');
}

document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const modal = new bootstrap.Modal(document.getElementById('bookingConfirmationModal'));
    modal.show();
    showSection('dashboard');
});

function renderHealthChart() {
    const ctx = document.getElementById('healthChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Weight (kg)',
                data: [70, 69, 68, 68, 69, 70],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }, {
                label: 'Blood Pressure (systolic)',
                data: [120, 118, 116, 117, 116, 118],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function searchDoctors() {
    const searchTerm = document.getElementById('doctorSearch').value.toLowerCase();
    const filteredDoctors = doctors.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm) || 
        doctor.specialty.toLowerCase().includes(searchTerm)
    );
    renderDoctorCards(filteredDoctors);
}

document.getElementById('doctorSearch').addEventListener('input', searchDoctors);

function initializePage() {
    showSection('welcome');
    document.getElementById('doctorSearch').addEventListener('input', searchDoctors);
}

window.addEventListener('load', initializePage);

function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
}

// Add smooth scrolling to all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add animation to buttons
document.querySelectorAll('.animated-button').forEach(button => {
    button.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
});

// Initialize tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
});