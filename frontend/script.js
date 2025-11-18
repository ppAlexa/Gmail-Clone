const mailContainer = document.getElementById("emailContainer");

// Fetch all emails from the backend
async function fetchMails() {
  try {
    const response = await fetch("http://localhost:8000/api/mail/getAll");
    const mails = await response.json();
    console.log(mails); // Log the fetched mails for debugging
    displayMails(mails);
  } catch (error) {
    mailContainer.innerHTML = `<p>Error fetching mails: ${error.message}</p>`;
  }
}

function displayMails(mails) {
  mailContainer.innerHTML = ""; // Clear the container

  if (!mails || mails.length === 0) {
    mailContainer.innerHTML = "<p>No mails found.</p>";
    
    return;
  }

  // Initialize category counts
  const categoryCounts = {
    Primary: 0,
    Social: 0,
    Promotions: 0,
    Updates: 0,
  };
console.log("mails:", mails);
  mails.forEach((mail) => {
    console.log("Processing Mail:", mail);
    const type = (mail.type || "Primary").trim();
    const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

    // Increment the count for the category only if the mail is "unseen"
    if (mail.status === "unseen" && categoryCounts[normalizedType] !== undefined) {
      categoryCounts[normalizedType]++;
    } else if (categoryCounts[normalizedType] === undefined) {
      console.warn(`Unexpected type: ${normalizedType}`);
    }

    const mailElement = document.createElement("div");
    mailElement.className = "emailRow";

    // Set background color based on the mail's status
    const backgroundColor = mail.status === "unseen" ? "#F5F7F7" : "#FFFFFF";
    mailElement.style.backgroundColor = backgroundColor;

    const rawDate = mail.timestamp || mail.date || mail.createdAt || Date.now();
    const formattedDate = new Date(rawDate).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const categoryBox =
      normalizedType === "Promotions"
        ? `<span class="categoryBox promotions">Promotions</span>`
        : normalizedType === "Updates"
        ? `<span class="categoryBox updates">Updates</span>`
        : "";

    mailElement.innerHTML = `
      <div class="emailBase">
        <div class="emailRA">
          <div class="emailGrad">
            <div class="rectangle12"></div>
          </div>
          <div class="component">
            <div class="time">${formattedDate}</div>
          </div>
        </div>
        <div class="subpre">
          <div class="star-icon-left">
            <img src="icons/${mail.starred ? "Star.png" : "Unstar.png"}" alt="Star" class="star-icon" data-id="${mail._id}" style="width: 22px; height: 22px;" />
          </div>
          <div class="categorybadge"></div>
          <div class="subplace">${mail.sender || "(Unknown sender)"}</div>
          ${mail.subject ? `<div class="text">${mail.subject}</div>` : ""}
          <div class="preview">
            ${categoryBox} ${mail.body ? mail.body.slice(0, 100) + "..." : ""}
          </div>
        </div>
        <div class="delete-icon" data-id="${mail._id}">
          <img src="icons/delete.png" alt="Delete" class="delete" />
        </div>
      </div>
    `;
    mailContainer.prepend(mailElement);
  });


  // Display the counts for each category
  displayCounts(categoryCounts);

  // Add event listeners for actions
  addEventListeners();
}

function displayCounts(categoryCounts) {

  for (const [type, count] of Object.entries(categoryCounts)) {
    const tab = document.getElementById(`tab-${type}`);
    if (tab) {


      // Remove any existing unread count badge
      const oldBadge = tab.querySelector(".unread-count");
      if (oldBadge) oldBadge.remove();

      // Add a new unread count badge if there are unread mails
      if (count > 0) {
        const badge = document.createElement("span");
        badge.className = `unread-count ${type.toLowerCase()}`;
        badge.textContent = `${count} new`;

        const labelSpan = tab.querySelector(".label");
        if (labelSpan) {
          labelSpan.appendChild(badge); // Append the unread count badge to the label
        }
      }
    } else {
      console.warn(`Tab not found for type: ${type}`); // Debugging: Warn if the tab is missing
    }
  }
}
function addEventListeners() {
  // Toggle star icon
  document.querySelectorAll(".star-icon").forEach((star) => {
    star.addEventListener("click", async (e) => {
      const emailId = e.target.getAttribute("data-id");
      const currentSrc = e.target.getAttribute("src");

      // Toggle the image source
      if (currentSrc.includes("Unstar.png")) {
        e.target.setAttribute("src", "icons/Star.png");
      } else {
        e.target.setAttribute("src", "icons/Unstar.png");
      }

      // Update the backend to toggle the starred state
      await toggleStar(emailId);
    });
  });

  // Delete email
  document.querySelectorAll(".delete-icon").forEach((deleteIcon) => {
    deleteIcon.addEventListener("click", async (e) => {
      const emailId = e.target.closest(".delete-icon").getAttribute("data-id");
      const emailRow = e.target.closest(".emailRow"); // Get the parent emailRow element

      // Remove the mail from the DOM
      emailRow.remove();

      // Send a DELETE request to the backend
      await deleteEmail(emailId);
    });
  });


  // Mark as read
  document.querySelectorAll(".read-icon .mark-read").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const emailId = e.target.closest(".read-icon").getAttribute("data-id");
      await markAsRead(emailId);
    });
  });
}

// Toggle star status in the backend
async function toggleStar(emailId) {
  try {
    await fetch(`http://localhost:8000/api/mail/star/${emailId}`, { method: "PUT" });
  } catch (error) {
    console.error("Error toggling star:", error);
  }
}

// Delete email
async function deleteEmail(emailId) {
  try {
    await fetch(`http://localhost:8000/api/mail/delete/${emailId}`, { method: "DELETE" });
    console.log(`Mail with ID ${emailId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting mail with ID ${emailId}:`, error);
  }
}

// Mark email as read
async function markAsRead(emailId) {
  try {
    await fetch(`http://localhost:8000/api/mail/read/${emailId}`, { method: "PUT" });
    fetchMails(); // Refresh emails
  } catch (error) {
    console.error("Error marking email as read:", error);
  }
}

// Fetch and display mails
fetchMails();