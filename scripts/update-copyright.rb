#!/usr/bin/env ruby

require 'date'

start_revision = ARGV[0]
year = ARGV[1]
if not start_revision
  start_revision = "HEAD~1"
end
if not year
  year = Date.today.year
end
puts "using start revision: #{start_revision}"

files = %x[git diff --name-only '#{start_revision}..HEAD' | grep '.*.js$'].split("\n")
files.each do |path|
  puts path
  begin
    content = File.read(path)
    content.gsub! /(?<head>.*\(C\) )(?<years>\d+|(?<year_a>\d+)-(?<year_b>\d+))(?<tail> ACK.*)/ do |match|
      if $~[:years]
        if $~[:year_a] and $~[:year_b]
          "#{$~[:head]}#{$~[:year_a]}-#{year}#{$~[:tail]}"
        elsif $~[:years] != year.to_s
          "#{$~[:head]}#{$~[:years]}-#{year}#{$~[:tail]}"
        else
          "#{$~[:head]}#{$~[:years]}#{$~[:tail]}"
        end
      end
    end
    File.write(path, content);
  rescue
    puts "Error reading file: #{$!}"
  end
end
