# local.public_subnets below are like this (see vpc-network.tf file):
# public_subnets = {
#   subnet_a = {
#     cidr_block = "10.0.1.0/24"
#     public     = true
#     AZ         = "us-east-1a"
#   }
#   subnet_c = {
#     cidr_block = "10.0.3.0/24"
#     public     = true
#     AZ         = "us-east-1c"
#   }
# }

locals {
  output_public_subnets = {
    # key takes on strings like subnet_a, subnet_c
    for key in keys(local.public_subnets) : key => {
      subnet_id         = aws_subnet.subnets_in_example_vpc[key].id
      availability_zone = aws_subnet.subnets_in_example_vpc[key].availability_zone
    }
  }

  output_private_subnets = {
    for key in keys(local.private_subnets) : key => {
      subnet_id         = aws_subnet.subnets_in_example_vpc[key].id
      availability_zone = aws_subnet.subnets_in_example_vpc[key].availability_zone
    }
  }
}

output "vpc_id" {
  value       = aws_vpc.example_vpc.id
  description = "The ID of the VPC."
}

output "public_subnets" {
  value = local.output_public_subnets
}

output "private_subnets" {
  value = local.output_private_subnets
}