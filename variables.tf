variable "resource_group_name" {
  type = string
}

variable "dev_test_lab_name" {
  type = string
}

variable "dev_test_virtual_network_name" {
  type = string
}

variable "dev_test_linux_virtual_machine_name" {
  type = string
}

variable "username" {
  type = string
}

variable "password" {
  type = string
}

variable "publisher" {
  type    = string
  default = "debian"
}

variable "offer" {
  type    = string
  default = "debian-10"
}

variable "sku" {
  type    = string
  default = "10"
}

variable "os_version" {
  type    = string
  default = "latest"
}