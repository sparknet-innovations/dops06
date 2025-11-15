variable "resource_group_name" {
  default = "rg-homeapplience"
}

variable "location" {
  default = "East US"
}

variable "admin_user" {
  default = "azureuser"
}

variable "admin_pass" {
  default = "Azure@12345" # only if using password-based VM
}
