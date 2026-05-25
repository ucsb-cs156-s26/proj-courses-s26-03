package edu.ucsb.cs156.courses.controllers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.servlet.error.ErrorAttributes;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.context.request.ServletWebRequest;

@Controller
public class GlobalErrorController implements ErrorController {

  @Autowired private ErrorAttributes errorAttributes;

  @GetMapping("/error")
  public String handleError(HttpServletRequest request, HttpSession session) {
    ErrorAttributeOptions options =
        ErrorAttributeOptions.of(
            ErrorAttributeOptions.Include.EXCEPTION,
            ErrorAttributeOptions.Include.STACK_TRACE,
            ErrorAttributeOptions.Include.MESSAGE,
            ErrorAttributeOptions.Include.BINDING_ERRORS);

    Map<String, Object> errorMap =
        errorAttributes.getErrorAttributes(new ServletWebRequest(request), options);

    session.setAttribute("currentError", errorMap);
    return "redirect:/errors";
  }
}
