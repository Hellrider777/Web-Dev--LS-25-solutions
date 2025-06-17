// This file contains JavaScript code that adds interactivity to the website.

// Example of an interactive timeline slider
const milestones = [
  { year: '2024', event: 'Started my journey at IIT Bombay' },
  { year: '2024', event: 'Participated in Mood Indigo' },
  { year: '2025', event: 'Joined the Devcom Club' },
  { year: '2025', event: 'Completed my first internship' },
];

function displayMilestones() {
  const timelineContainer = document.getElementById('timeline');
  milestones.forEach((milestone) => {
    const milestoneElement = document.createElement('div');
    milestoneElement.className = 'milestone';
    milestoneElement.innerHTML = `<strong>${milestone.year}</strong>: ${milestone.event}`;
    timelineContainer.appendChild(milestoneElement);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  displayMilestones();
});

// Example of a simple form validation
function validateForm() {
  const name = document.getElementById('name').value;
  const message = document.getElementById('message').value;
  if (name === '' || message === '') {
    alert('Please fill in all fields.');
    return false;
  }
  alert('Thank you for your message!');
  return true;
}

document
  .getElementById('guestbook-form')
  .addEventListener('submit', function (event) {
    event.preventDefault();
    validateForm();
  });
