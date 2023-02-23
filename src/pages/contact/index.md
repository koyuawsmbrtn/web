---
layout: "../../layouts/page.astro"
title: "Contact"
description: "Contact me"
---

<form name="contact" method="POST" action="/contact/success" data-netlify="true">
  <p>
    <label>Your Name: <input type="text" name="name" required /></label>
  </p>
  <p>
    <label>Your Email: <input type="email" name="email" required /></label>
  </p>
  <p>
    <label>Message: <textarea name="message" rows="12" cols="32" required></textarea></label>
  </p>
  <p>
    <label>Attachment: <input type="file" name="attachment" rows="12" cols="32" required /></label>
  </p>
  <p>
    <button type="submit">Send</button>
  </p>
</form>