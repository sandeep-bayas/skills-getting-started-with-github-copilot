document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageEl = document.getElementById("message");

  function showMessage(text, type = "info") {
    messageEl.className = `message ${type}`;
    messageEl.textContent = text;
    messageEl.style.display = "block";
    setTimeout(() => (messageEl.style.display = "none"), 4000);
  }

  function renderActivities(activities) {
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    Object.entries(activities).forEach(([name, activity]) => {
      const card = document.createElement("div");
      card.className = "activity-card";

      const title = document.createElement("h4");
      title.textContent = name;

      const desc = document.createElement("p");
      desc.textContent = activity.description;

      const schedule = document.createElement("p");
      schedule.innerHTML = `<strong>Schedule:</strong> ${activity.schedule}`;

      const spotsCount = activity.participants ? activity.participants.length : 0;
      const spots = document.createElement("p");
      spots.innerHTML = `<strong>Spots:</strong> ${spotsCount} / ${activity.max_participants} (${Math.max(
        activity.max_participants - spotsCount,
        0
      )} remaining)`;

      const participantsSection = document.createElement("div");
      participantsSection.className = "participants-section";
      const participantsTitle = document.createElement("h5");
      participantsTitle.textContent = "Participants";
      participantsSection.appendChild(participantsTitle);

      if (activity.participants && activity.participants.length) {
        const ul = document.createElement("ul");
        ul.className = "participants-list";
        activity.participants.forEach((email) => {
          const li = document.createElement("li");
          li.textContent = email;
          ul.appendChild(li);
        });
        participantsSection.appendChild(ul);
      } else {
        const p = document.createElement("p");
        p.className = "info";
        p.textContent = "No participants yet.";
        participantsSection.appendChild(p);
      }

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(schedule);
      card.appendChild(spots);
      card.appendChild(participantsSection);

      activitiesList.appendChild(card);

      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      activitySelect.appendChild(opt);
    });
  }

  async function loadActivities() {
    activitiesList.innerHTML = "<p>Loading activities...</p>";
    try {
      const res = await fetch("/activities");
      if (!res.ok) throw new Error(`Failed to load activities: ${res.status}`);
      const data = await res.json();
      renderActivities(data);
    } catch (e) {
      activitiesList.innerHTML = '<p class="error">Could not load activities.</p>';
      console.error(e);
    }
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const activity = document.getElementById("activity").value;
    if (!email || !activity) {
      showMessage("Please provide an email and select an activity.", "error");
      return;
    }

    try {
      const res = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );
      const body = await res.json();
      if (!res.ok) {
        showMessage(body.detail || "Error signing up", "error");
        return;
      }
      showMessage(body.message || "Signed up successfully", "success");
      signupForm.reset();
      await loadActivities();
    } catch (err) {
      showMessage("Network error while signing up", "error");
      console.error(err);
    }
  });

  loadActivities();
});
