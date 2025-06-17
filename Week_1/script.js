const milestones = [
  { year: '2024', event: 'Started my journey at IIT Bombay' },
  { year: '2024', event: 'Participated in Mood Indigo' },
  { year: '2025', event: 'Joined the Devcom Club' },
  { year: '2025', event: 'Completed my first internship' },
];

function displayMilestones() {
  const timelineContainer = document.getElementById('timelineContent');
  if (!timelineContainer) {
    console.error('Element with id "timelineContent" not found.');
    return;
  }

  // Toggle visibility
  const isHidden = getComputedStyle(timelineContainer).display === 'none';
  timelineContainer.style.display = isHidden ? 'block' : 'none';

  if (isHidden) {
    // Clear existing content before re-rendering
    timelineContainer.innerHTML = '';
    milestones.forEach((milestone) => {
      timelineContainer.innerHTML += `<p><strong>${milestone.year}</strong>: ${milestone.event}</p>`;
    });
  }
}
