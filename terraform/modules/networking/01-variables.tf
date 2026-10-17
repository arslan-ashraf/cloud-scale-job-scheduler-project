variable "vpc_config" {
  type = object({
    cidr_block = string
    name       = string
  })

  validation {
    condition     = can(cidrnetmask(var.vpc_config.cidr_block))
    error_message = "The VPC cidr_block must be valid."
  }
}

variable "subnet_config" {
  type = map(object({
    cidr_block = string
    public     = optional(bool, false)
    AZ         = string
  }))

  validation {
    condition = alltrue([
      for config in values(var.subnet_config) : can(cidrnetmask(config.cidr_block))
    ])
    error_message = "The subnet cidr_block must be valid."
  }
}

# the subnet_config map defined above would look like this:
# subnet_config = {
#   subnet_a = {
#     cidr_block = "10.0.1.0/24"
#     public     = true
#     AZ         = "us-east-1a"
#   }
#   subnet_b = {
#     cidr_block = "10.0.2.0/24"
#     public     = false
#     AZ         = "us-east-1b"
#   }
#   subnet_c = {
#     cidr_block = "10.0.3.0/24"
#     public     = true
#     AZ         = "us-east-1c"
#   }
# }