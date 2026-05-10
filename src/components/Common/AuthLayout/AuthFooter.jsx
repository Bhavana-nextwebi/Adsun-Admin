import React from "react";

export const AuthFooter = () => {
  return (
    <>
      <footer className="footer ">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center">
                <p className="mb-0 text-muted">
                  &copy;
                  <script>document.write(new Date().getFullYear())</script> JLT.
                  Crafted by Nextwebi
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
