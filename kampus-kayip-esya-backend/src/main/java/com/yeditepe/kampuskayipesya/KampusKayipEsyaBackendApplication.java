package com.yeditepe.kampuskayipesya;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Uygulamanın giriş noktası (Spring Boot).
 *
 * main() metodu çalıştığında Spring, @Component / @Service / @Repository
 * işaretli tüm sınıfları bulup birbirine bağlar ve gömülü Tomcat sunucusunu
 * 8080 portunda başlatır.
 */
@SpringBootApplication
public class KampusKayipEsyaBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(KampusKayipEsyaBackendApplication.class, args);
	}

}
