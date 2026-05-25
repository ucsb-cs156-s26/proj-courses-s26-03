package edu.ucsb.cs156.courses.controllers;

import jakarta.servlet.http.HttpSession;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ErrorInfoController {

  @GetMapping("/api/currentError")
  public ResponseEntity<Map<String, Object>> getCurrentError(HttpSession session) {
    @SuppressWarnings("unchecked")
    Map<String, Object> errorInfo = (Map<String, Object>) session.getAttribute("currentError");
    if (errorInfo == null) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(errorInfo);
  }
}
