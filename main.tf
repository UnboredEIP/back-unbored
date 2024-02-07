terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0.2"
    }
  }

  cloud {
    organization = "UnBored"
    workspaces {
      name = "back-unbored"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}
