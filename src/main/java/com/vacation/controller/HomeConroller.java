package com.vacation.controller;


import com.vacation.service.OpenApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;

@Controller
@RequestMapping("/")
@RequiredArgsConstructor
public class HomeConroller {




    @GetMapping
    public String home(){
        return "home";
    }




}
