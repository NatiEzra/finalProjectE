const port=process.env.PORT;

import initApp from "./server";

initApp().then((app) => {
  console.log("here "+ process.env.PORT +" "+ port);
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });

});

