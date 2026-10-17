locals {
  public_subnets = {
    for key, config in var.subnet_config : key => config if config.public == true
  }

  private_subnets = {
    for key, config in var.subnet_config : key => config if config.public == false
  }
}

data "aws_availability_zones" "AZs" {
  state = "available"
}

resource "aws_vpc" "example_vpc" {
  cidr_block = var.vpc_config.cidr_block
  tags       = { Name = var.vpc_config.name }
}

# multiple subnets with for_each loop
resource "aws_subnet" "subnets_in_example_vpc" {
  for_each          = var.subnet_config
  vpc_id            = aws_vpc.example_vpc.id
  availability_zone = each.value.AZ
  cidr_block        = each.value.cidr_block

  tags = {
    Name = "${each.value.public == true ? "public" : "private"}_${each.key}"
  }

  lifecycle {
    precondition {
      condition     = contains(data.aws_availability_zones.AZs.names, each.value.AZ)
      error_message = "Invalid AZ provided: only allowed AZs [${join(", ", data.aws_availability_zones.AZs.names)}]."
    }
  }
}

resource "aws_internet_gateway" "example_internet_gateway" {
  count  = length(local.public_subnets) > 0 ? 1 : 0
  vpc_id = aws_vpc.example_vpc.id
}

resource "aws_route_table" "route_table_in_example_vpc" {
  count  = length(local.public_subnets) > 0 ? 1 : 0
  vpc_id = aws_vpc.example_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    # there may be 0 or 1 internet gateway if there is at least one public subnet
    # in this example there is only 1 public subnet and the internet gateway is
    # wrapped inside an array, hence: example_internet_gateway[0]
    gateway_id = aws_internet_gateway.example_internet_gateway[0].id
  }
}

# note: a subnet can only be attached to a single route table
resource "aws_route_table_association" "route_table_for_public_subnets" {
  for_each = local.public_subnets # as listed at the top of file

  subnet_id      = aws_subnet.subnets_in_example_vpc[each.key].id
  route_table_id = aws_route_table.route_table_in_example_vpc[0].id
}