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
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = "France Central"
}

resource "azurerm_dev_test_lab" "dtl" {
  name                = var.dev_test_lab_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

# resource "azurerm_dev_test_virtual_network" "dtvt" {
# name                = var.dev_test_virtual_network_name
# lab_name            = azurerm_dev_test_lab.dtl.name
# resource_group_name = azurerm_resource_group.rg.name
# 
# subnet {
# use_public_ip_address           = "Allow"
# use_in_virtual_machine_creation = "Allow"
# }
# }
# 
# resource "azurerm_dev_test_linux_virtual_machine" "dtvm" {
# name                   = var.dev_test_linux_virtual_machine_name
# lab_name               = azurerm_dev_test_lab.dtl.name
# resource_group_name    = azurerm_resource_group.rg.name
# location               = azurerm_resource_group.rg.location
# size                   = "Standard_B1ms"
# username               = var.username
# password               = var.password
# lab_virtual_network_id = azurerm_dev_test_virtual_network.dtvt.id
# lab_subnet_name        = azurerm_dev_test_virtual_network.dtvt.subnet[0].name
# storage_type           = "Standard"
# 
# gallery_image_reference {
# publisher = var.publisher
# offer     = var.offer
# sku       = var.sku
# version   = var.os_version
# }
# }