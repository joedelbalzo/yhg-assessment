This is the public version of a repository that controls the code redemption portal on https://yourhiddengenius.com.
It is not as up-to-date or as thorough as the private version. Sorry :)
But, you can still get a glimpse into how I like to work!

What this does is it accepts a user's email, code, type of book, and whether or not it was purchased or borrowed. Several things happen as the user is about to hit the submit button. 

1) A user passes an invisible reCAPTCHA. If the user either fails the reCAPTCHA or is submitting a code from a digital book, the user also has to pass a v2 visible reCAPTCHA.
2) Upon submission, the form fields are verified for the first time. There are three possible errors here -- one for a failed code regex, one for a failed email regex (which is VERY basic for front end), and a connection error. If successful, the data is all moved along. 
3) Once received by the Express server, the data is verified again with a more stringent regex for the code and a validation library for the email. If that's successful, the code moves into a processing queue.
4) We process one submission per second. I know that's low, but the overall usage of this is not expected to be more than a few hundred users per day. One submission per second allows us to use Google Sheets as a database, which is something we needed to do for the sake of our clients.
5) In order to minimize API calls and using Google Sheets when we don't need to, a small cache of a few thousand of the most recent users is maintained. This is used for users who have either already done this whole process or who are going through the "forgot your code?" pathway. So upon processing, the first thing the code does is check the cache.
6) Afterwards, the code is submitted to a Google Apps Script. This is where, using far fewer API calls and not coming anywhere near the API limits, we're able to check against all of the data that already exists, create new data, and retreive third party data. This is all returned to the user in, on average, 2 seconds.
7) There are obviously several error points here, many of which you can read in a custom-built error object I made. I didn't intend on needing a custom error object, but as this project snowballed, I found myself having repeated errors that were just not quite the wording they needed to be, and I also figured that instead of having multiple error states in the front end, I could just display <h1>{error.status}</h1> <p>{error.message}</p> and it would be very clear for the user and for the customer support agent. 
8) Once a user clicks on their third party link, they are done! They can minimize and continue to peruse the website. We have method for them to return in case they've forgotten their unique third party link, but once they set up their profile through the third party link, everything is officially out of our hands.

That's the pseudocode in a nutshell. I hope my work makes sense!
