package com.vacation.config;

import com.vacation.service.OpenApiService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

import java.io.IOException;

@RequiredArgsConstructor
@Component
public class openApiScheduler {




    private final OpenApiService  openApiService;



    @Scheduled(cron = "0 0 0 * * *")
    public void getOpenApi() throws IOException {


//        Object year;
//        openApiService.getOpenApiScheduler(String year);
//

    }}
