package com.vacation.controller;


import com.vacation.HolidayDto;
import com.vacation.service.OpenApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class HomeRestController {


    private final OpenApiService openApiService;


    @GetMapping("/getData")
    public List<HolidayDto> getData(@RequestParam String year) throws IOException {
     return   openApiService.getOpenApiScheduler(year);


    }
}
