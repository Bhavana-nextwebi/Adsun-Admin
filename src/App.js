import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import routes from "./route/routes.config"


function App() {
  return (
    <Router>
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.element}
          >
            {route.children && route.children.map((childRoute, childIndex) => (
              <Route
                key={childIndex}
                path={childRoute.path}
                element={childRoute.element}
              >
                {childRoute.children && childRoute.children.map((grandChildRoute, grandChildIndex) => (
                  <Route
                    key={grandChildIndex}
                    path={grandChildRoute.path}
                    element={grandChildRoute.element}
                  >
                    {grandChildRoute.children && grandChildRoute.children.map((grandgrandChildRoute, grandgrandChildIndex) => (
                      <Route
                        key={grandgrandChildIndex}
                        path={grandgrandChildRoute.path}
                        element={grandgrandChildRoute.element}
                      />
                    ))}
                  </Route>
                ))}
              </Route>
            ))}
          </Route>
        ))}
      </Routes>
    </Router>
  );
}

export default App;