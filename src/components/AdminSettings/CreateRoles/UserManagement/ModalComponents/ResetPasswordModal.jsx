import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { validatePasswordForm } from "../../../../../utils/validation";

const ResetPasswordModal = ({ show, onHide, userId, userName, onReset }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const resetFormFields = () => {
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  const handleReset = async () => {
    const validationErrors = validatePasswordForm(newPassword, confirmPassword);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    await onReset({ id: userId, newPassword });
    resetFormFields();
  };

  const togglePasswordVisibility = (setter, currentState) =>
    setter(!currentState);

  useEffect(() => {
    if (!show) resetFormFields();
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Reset Password <br />{" "}
          <h5>
            User Name: <b>{userName}</b>
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formNewPassword">
            <Form.Label className="pt-2">
              New Password <span className="required-field">*</span>
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                isInvalid={!!errors.newPassword}
              />
              <span
                className="input-group-text"
                onClick={() =>
                  togglePasswordVisibility(setShowNewPassword, showNewPassword)
                }
                style={{ cursor: "pointer" }}
              >
                <i
                  className={
                    showNewPassword ? "ri-eye-line" : "ri-eye-off-line"
                  }
                />
              </span>
              {errors.newPassword && (
                <div className="invalid-feedback">{errors.newPassword}</div>
              )}
            </div>
          </Form.Group>
          <Form.Group controlId="formConfirmPassword">
            <Form.Label className="pt-2">Confirm Password</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                isInvalid={!!errors.confirmPassword}
              />
              <span
                className="input-group-text"
                onClick={() =>
                  togglePasswordVisibility(
                    setShowConfirmPassword,
                    showConfirmPassword
                  )
                }
                style={{ cursor: "pointer" }}
              >
                <i
                  className={
                    showConfirmPassword ? "ri-eye-line" : "ri-eye-off-line"
                  }
                />
              </span>
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleReset}>
          Reset Password
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResetPasswordModal;
